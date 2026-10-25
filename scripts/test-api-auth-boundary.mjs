import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { setTimeout as pause } from "node:timers/promises";

// Disposable local process: test the authentication boundary without touching a DB.
const token = randomBytes(32).toString("hex");
const port = 31379;
const base = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
  env: { ...process.env, PROSPECTOR_API_TOKEN: token },
  stdio: "ignore",
  windowsHide: true,
});
try {
  let ready = false;
  for (let i = 0; i < 80; i++) {
    if (child.exitCode !== null) throw new Error("Server exited before readiness");
    try {
      const r = await fetch(base + "/api/seed");
      if (r.status === 401) { ready = true; break; }
    } catch { /* starting */ }
    await pause(250);
  }
  assert.ok(ready, "Server did not start or API gate did not reject unauthenticated request");
  for (const authorization of [undefined, "Bearer invalid", "Basic abc", "Bearer "]) {
    const response = await fetch(base + "/api/seed", {
      headers: authorization ? { authorization } : {},
      method: "POST",
    });
    assert.equal(response.status, 401, "Malformed or absent token must be denied");
  }
  const allowed = await fetch(base + "/api/seed", {
    headers: { authorization: `Bearer ${token}` },
    method: "POST",
  });
  assert.equal(allowed.status, 403, "Valid token must reach disabled seed handler");
  console.log("PASS: four denied requests, one verified token passed gate but seed stayed disabled");
} finally {
  child.kill();
}
