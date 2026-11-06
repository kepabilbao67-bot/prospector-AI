import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { setTimeout as pause } from "node:timers/promises";
import { PrismaClient } from "@prisma/client";

assert.match(process.env.DATABASE_URL || "", /^file:\.\/test-prospector-[\w-]+\.db$/, "Refuse non-test database");
const db = new PrismaClient();
const run = randomUUID();
const own = `qa-own-${run}`, other = `qa-other-${run}`;
const token = randomBytes(32).toString("hex");
const root = "http://127.0.0.1:31383";
const campaigns = [], tasks = [];
let child;
const headers = { authorization: `Bearer ${token}` };
try {
  for (const [i, userId] of [own, other].entries())
    await db.user.create({ data: { id: userId, email: `campaign-qa-${run}-${i}@example.invalid`, name: "QA", password: "not-a-login" } });
  for (const userId of [own, other]) {
    campaigns.push(await db.campaign.create({ data: { userId, name: `QA ${run}`, network: "multi" } }));
    tasks.push(await db.taskQueue.create({
      data: { userId, type: "qa_no_send", network: "other", payload: "{}", status: "cancelled", scheduledAt: new Date() },
    }));
  }
  child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", "31383"], {
    env: { ...process.env, PROSPECTOR_API_TOKEN: token, PROSPECTOR_OPERATOR_USER_ID: own },
    stdio: "ignore", windowsHide: true,
  });
  let ready = false;
  for (let i = 0; i < 80; i++) {
    if (child.exitCode !== null) throw new Error("Test server exited");
    try {
      const r = await fetch(root + "/api/queue", { headers });
      if (r.status === 200) { ready = true; break; }
    } catch { /* starting */ }
    await pause(250);
  }
  assert.ok(ready, "Queue route failed to start");
  const list = await (await fetch(root + "/api/queue", { headers })).json();
  assert.ok(list.tasks.some(t => t.id === tasks[0].id), "Own task not returned");
  assert.ok(list.tasks.every(t => t.id !== tasks[1].id), "Other tenant task leaked");
  const mine = await fetch(root + "/api/campaigns/" + campaigns[0].id, { headers });
  assert.equal(mine.status, 200, "Own campaign unavailable");
  assert.equal((await mine.json()).id, campaigns[0].id);
  const foreign = await fetch(root + "/api/campaigns/" + campaigns[1].id, { headers });
  assert.equal(foreign.status, 404, "Foreign campaign must be hidden");
  assert.equal((await fetch(root + "/api/queue", { method: "POST", headers })).status, 503, "Scheduling must be disabled");
  for (const method of ["PUT", "DELETE"])
    assert.equal((await fetch(root + "/api/campaigns/" + campaigns[0].id, { method, headers })).status, 503, method + " must stay disabled");
  console.log("PASS: campaign + queue ownership and write holds over HTTP");
} finally {
  if (child) child.kill();
  for (const t of tasks) await db.taskQueue.delete({ where: { id: t.id } });
  for (const c of campaigns) await db.campaign.delete({ where: { id: c.id } });
  for (const id of [own, other]) await db.user.deleteMany({ where: { id } });
  await db.$disconnect();
}
