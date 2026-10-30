import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as pause } from "node:timers/promises";

// Run only against an isolated local build. This is a required regression
// test for a future session-based implementation, not a current PASS claim.
// No production URLs, user credentials, or persistent databases are used.
const port = 31385;
const origin = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
  env: { ...process.env, PROSPECTOR_API_TOKEN: "", PROSPECTOR_OPERATOR_USER_ID: "" },
  stdio: "ignore",
  windowsHide: true,
});
try {
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    if (child.exitCode !== null) throw new Error("Isolated Next.js server exited");
    try {
      const response = await fetch(origin + "/api/contacts", { redirect: "manual" });
      if (response.status === 401) { ready = true; break; }
    } catch { /* waiting for local server */ }
    await pause(250);
  }
  assert.ok(ready, "Local API auth gate did not start");
  for (const path of ["/", "/contacts", "/campaigns", "/pipeline", "/settings"]) {
    const response = await fetch(origin + path, { redirect: "manual" });
    assert.ok(
      [302, 303, 307, 308, 401, 403].includes(response.status),
      `Anonymous page ${path} returned ${response.status}: expected login redirect or denial`,
    );
    if ([302, 303, 307, 308].includes(response.status)) {
      const redirect = response.headers.get("location") || "";
      assert.ok(
        redirect.startsWith("/") || redirect.startsWith(origin),
        `Unsafe redirect from ${path}: ${redirect}`,
      );
      assert.notEqual(redirect, path, "Redirect loop to same page");
    }
  }
  console.log("PASS: protected dashboard pages reject anonymous access");
} finally {
  child.kill();
}
