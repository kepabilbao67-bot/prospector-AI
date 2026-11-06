import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { setTimeout as pause } from "node:timers/promises";
import { PrismaClient } from "@prisma/client";

const url = process.env.DATABASE_URL || "";
assert.match(url, /^file:\.\/test-prospector-[\w-]+\.db$/, "Refusing non-test database");
const prisma = new PrismaClient();
const run = randomUUID();
const operator = `qa-operator-${run}`;
const outsider = `qa-outsider-${run}`;
const token = randomBytes(32).toString("hex");
const port = 31382;
const base = `http://127.0.0.1:${port}`;
const inserted = [];
let child;
try {
  for (const [n, id] of [operator, outsider].entries()) {
    await prisma.user.create({ data: { id, email: `qa-${run}-${n}@example.invalid`, name: "Disposable", password: "not-for-login" } });
  }
  for (const [userId, email] of [[operator, "duplicate@example.invalid"], [operator, "DUPLICATE@example.invalid"], [outsider, "duplicate@example.invalid"]]) {
    const contact = await prisma.contact.create({ data: { userId, firstName: "QA", company: "Fixture", email, network: "other" } });
    inserted.push(contact.id);
  }
  child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
    env: { ...process.env, PROSPECTOR_API_TOKEN: token, PROSPECTOR_OPERATOR_USER_ID: operator },
    stdio: "ignore", windowsHide: true,
  });
  let response;
  for (let i = 0; i < 80; i++) {
    if (child.exitCode !== null) throw new Error("Server exited");
    try {
      response = await fetch(base + "/api/contacts/duplicates", { headers: { authorization: `Bearer ${token}` } });
      if (response.status === 200) break;
    } catch { /* starting */ }
    await pause(250);
  }
  assert.equal(response?.status, 200, "Duplicate endpoint must be available");
  const data = await response.json();
  assert.ok(data.duplicates.some(group => group.ids.length === 2 && group.ids.every(id => inserted.slice(0, 2).includes(id))), "Expected owned duplicate pair");
  assert.ok(data.duplicates.every(group => group.ids.every(id => id !== inserted[2])), "Other tenant contact leaked");
  console.log("PASS: duplicate HTTP endpoint finds owned duplicates and hides other tenant");
} finally {
  if (child) child.kill();
  for (const id of inserted) await prisma.contact.delete({ where: { id } });
  for (const id of [operator, outsider]) await prisma.user.deleteMany({ where: { id } });
  await prisma.$disconnect();
}
