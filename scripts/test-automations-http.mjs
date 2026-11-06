import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { setTimeout as pause } from "node:timers/promises";

// No credentials or external integrations: verify that automation trigger is a hard stop.
const port = 31384;
const token = randomBytes(32).toString("hex");
const origin = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
  env: { ...process.env, PROSPECTOR_API_TOKEN: token },
  stdio: "ignore",
  windowsHide: true,
});
try {
  let ready = false;
  for (let i = 0; i < 80; i++) {
    if (child.exitCode !== null) throw new Error("Server exited before ready");
    try {
      const r = await fetch(origin + "/api/automations");
      if (r.status === 401) { ready = true; break; }
    } catch { /* starting */ }
    await pause(250);
  }
  assert.ok(ready, "Authentication gate not ready");
  const headers = { authorization: `Bearer ${token}`, "content-type": "application/json" };
  const get = await fetch(origin + "/api/automations", { headers });
  assert.equal(get.status, 200);
  const list = await get.json();
  assert.equal(list.executionEnabled, false);
  assert.equal(list.simulationOnly, true);
  const trigger = await fetch(origin + "/api/automations", {
    method: "POST", headers,
    body: JSON.stringify({ action: "trigger", triggerType: "new_contact" }),
  });
  assert.equal(trigger.status, 503);
  const result = await trigger.json();
  assert.equal(result.triggered, 0);
  assert.equal(result.executionEnabled, false);
  console.log("PASS: automations are simulation-only and cannot report fake triggers");
} finally {
  child.kill();
}
