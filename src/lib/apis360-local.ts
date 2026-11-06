/**
 * Puente servidor → APIs360. Únicamente loopback, modelo local y coste externo cero.
 * No admite URL arbitraria ni fallback cloud.
 */
const BASE = "http://127.0.0.1:3737/v1";
const PROJECT = "prospector360";

type GatewayStatus = {
  service?: string;
  localOnly?: boolean;
  ai?: { local?: { available?: boolean; modelInstalled?: boolean } };
};
type ProjectStatus = {
  id?: string;
  mode?: string;
  allowCloudExplicit?: boolean;
  allowAutomaticCloudFallback?: boolean;
};
type Answer = {
  source?: string;
  cost?: { requestUsd?: number };
  recommendation?: { text?: string };
};

export async function apis360LocalAvailable(
  fetcher: typeof fetch = fetch
): Promise<boolean> {
  try {
    const [health, project] = await Promise.all([
      fetcher(BASE + "/status", {
        cache: "no-store",
        signal: AbortSignal.timeout(3500),
      }),
      fetcher(BASE + "/projects/" + PROJECT, {
        cache: "no-store",
        signal: AbortSignal.timeout(3500),
      }),
    ]);
    if (!health.ok || !project.ok) return false;
    const status = (await health.json()) as GatewayStatus;
    const config = (await project.json()) as ProjectStatus;
    return status.service === "apis360" &&
      status.localOnly === true &&
      status.ai?.local?.available === true &&
      status.ai?.local?.modelInstalled === true &&
      config.id === PROJECT &&
      config.mode === "local" &&
      config.allowCloudExplicit === false &&
      config.allowAutomaticCloudFallback === false;
  } catch {
    return false;
  }
}

export async function askApis360Local(
  prompt: string,
  fetcher: typeof fetch = fetch
): Promise<string> {
  if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 6000) {
    throw new Error("AI360_INVALID_PROMPT");
  }
  const result = await fetcher(BASE + "/ai/ask", {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "x-kepa-project": PROJECT,
    },
    signal: AbortSignal.timeout(90000),
    body: JSON.stringify({ project: PROJECT, mode: "local", prompt }),
  });
  if (!result.ok) throw new Error("AI360_GATEWAY_UNAVAILABLE");
  const data = (await result.json()) as Answer;
  const text = data.recommendation?.text;
  if (data.source !== "local" || data.cost?.requestUsd !== 0 ||
      typeof text !== "string" || !text.trim()) {
    throw new Error("AI360_NOT_VERIFIED_LOCAL");
  }
  return text.trim();
}
