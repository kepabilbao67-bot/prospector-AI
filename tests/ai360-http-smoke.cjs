/* Local-only opt-in HTTP smoke test, requires an ephemeral QA session secret. */
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const PORT = 3893;
const BASE = "http://127.0.0.1:" + PORT;
const secret = process.env.SESSION_SECRET;
if (process.env.AI360_QA_LOCAL !== "1" || !secret?.startsWith("PROSPECTOR360_QA_ONLY_")) {
  throw new Error("QA_ONLY_SESSION_REQUIRED");
}
const token = jwt.sign({}, secret, {
  issuer: "prospector-ai", audience: "prospector-ai", algorithm: "HS256",
  subject: "qa-user", expiresIn: "5m"
});
const headers = { Cookie: "prospector_session=" + token };
async function main(){
  const unauthed = await fetch(BASE + "/api/ai360");
  assert.equal(unauthed.status, 401, "sin sesión debe rechazar");
  const status = await fetch(BASE + "/api/ai360", { headers });
  assert.equal(status.status, 200, "estado autenticado");
  const details = await status.json();
  assert.equal(details.available, true, "gateway activo");
  assert.equal(details.cloud, false);
  const badOrigin = await fetch(BASE + "/api/ai360", {
    method: "POST",
    headers: { ...headers, "Content-Type":"application/json", Origin:"https://attacker.example" },
    body: JSON.stringify({action:"draft_message",context:{}}),
  });
  assert.equal(badOrigin.status, 403, "origen ajeno rechazado");
  const request = {
    action: "draft_message",
    context: {
      contact: { network: "linkedin", firstName: "{{nombre}}", company: "{{empresa}}" },
      tone: "professional", language: "es", messageType: "first_message",
      product: { name: "Documentos 360", description:"Organización de documentos",
                 benefits:["Ahorra tiempo en tareas repetitivas"] }
    }
  };
  const drafted = await fetch(BASE + "/api/ai360", {
    method:"POST",
    headers:{ ...headers, "Content-Type":"application/json", Origin:BASE },
    body:JSON.stringify(request),
  });
  const reply = await drafted.json();
  assert.equal(drafted.status, 200, "borrador devuelto: "+JSON.stringify(reply).slice(0,200));
  assert.equal(reply.source, "apis360-local");
  assert.equal(reply.costUsd, 0);
  assert.equal(reply.draftOnly, true);
  assert.equal(typeof reply.message, "string");
  assert.ok(reply.message.length>0 && reply.message.length<=300);
  console.log(JSON.stringify({unauthorized:401,csrf:403,authenticated:200,
    available:true,source:reply.source,costUsd:reply.costUsd,draftOnly:reply.draftOnly,
    messageLength:reply.message.length}));
}
main().catch(err=>{console.error("HTTP_QA_FAILED",err.message);process.exitCode=1});
