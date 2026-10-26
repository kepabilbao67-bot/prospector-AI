import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as pause } from "node:timers/promises";

// Run only against a disposable, locally launched instance with no real credentials.
// An absent token must fail closed for every API endpoint.
const port = 31378;
const base = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
  env: { ...process.env, PROSPECTOR_API_TOKEN: "" },
  stdio: "ignore",
  windowsHide: true,
});
try {
  let ready = false;
  for (let i = 0; i < 80; i++) {
    if (child.exitCode !== null) throw new Error("Server exited before readiness");
    try {
      const response = await fetch(`${base}/api/contacts`);
      if (response.status === 401) { ready = true; break; }
    } catch { /* server starting */ }
    await pause(250);
  }
  assert.ok(ready, "Unauthenticated API must return HTTP 401");
  for (const path of ["/api/contacts", "/api/campaigns", "/api/analytics", "/api/seed", "/api/queue", "/api/templates"]) {
    for (const auth of [undefined, "Bearer invalid"]) {
      const headers = auth ? { authorization: auth } : {};
      const response = await fetch(base + path, { headers });
      assert.equal(response.status, 401, `${path} should reject unauthorized requests`);
    }
  }
  console.log("PASS: 12 unauthorized API requests rejected");
} finally {
  child.kill();
}
