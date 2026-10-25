import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";

// Refuse to run against production or an unrecognized database.
const url = process.env.DATABASE_URL || "";
if (!/^file:\.\/test-prospector-[\w-]+\.db$/.test(url)) {
  throw new Error("Test requires DATABASE_URL=file:./test-prospector-<id>.db");
}
const prisma = new PrismaClient();
const run = randomUUID();
const userIds = [`qa-a-${run}`, `qa-b-${run}`];
const createdContacts = [];
const createdCampaigns = [];
try {
  for (const [i, id] of userIds.entries()) {
    await prisma.user.create({
      data: { id, email: `qa-${run}-${i}@example.invalid`, name: "Disposable QA tenant", password: "no-login" },
    });
    const c = await prisma.contact.create({
      data: { userId: id, firstName: `QA_${run}`, network: "other" },
    });
    createdContacts.push(c.id);
    const camp = await prisma.campaign.create({
      data: { userId: id, name: `QA_${run}`, network: "multi" },
    });
    createdCampaigns.push(camp.id);
  }
  for (const [i, userId] of userIds.entries()) {
    const ownContacts = await prisma.contact.findMany({ where: { userId, firstName: `QA_${run}` } });
    const ownCampaigns = await prisma.campaign.findMany({ where: { userId, name: `QA_${run}` } });
    assert.equal(ownContacts.length, 1);
    assert.equal(ownCampaigns.length, 1);
    assert.equal(ownContacts[0].id, createdContacts[i]);
    assert.equal(ownCampaigns[0].id, createdCampaigns[i]);
  }
  console.log("PASS: owner-scoped Prisma contacts and campaigns for two disposable tenants");
} finally {
  for (const id of createdCampaigns) await prisma.campaign.delete({ where: { id } });
  for (const id of createdContacts) await prisma.contact.delete({ where: { id } });
  for (const id of userIds) await prisma.user.deleteMany({ where: { id } });
  await prisma.$disconnect();
}
