import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

// Run after next build: node scripts/test-anonymous-boundary.mjs
// Local-only, no credentials and no DB writes.
const port=31386, origin=`http://127.0.0.1:${port}`;
const server=spawn(process.execPath,["node_modules/next/dist/bin/next","start","-p",String(port)],{
 env:{...process.env,NODE_ENV:"production"},stdio:"ignore",windowsHide:true
});
try {
 let ready=false;
 for(let i=0;i<80;i++){
  if(server.exitCode!==null)throw new Error("Next server exited");
  try { const r=await fetch(origin+"/login",{redirect:"manual"});if(r.status===200){ready=true;break;} }catch{}
  await delay(250);
 }
 assert.ok(ready,"Local Next.js server did not become ready");
 for(const path of ["/","/contacts","/campaigns","/pipeline","/analytics","/inbox","/automations","/wizard","/content","/templates","/settings"]){
  const r=await fetch(origin+path,{redirect:"manual"});
  assert.equal(r.status,307,`${path} must redirect anonymous requests`);
  assert.equal(new URL(r.headers.get("location"),origin).pathname,"/login");
 }
 for(const path of ["/api/contacts","/api/campaigns","/api/analytics"]){
  const r=await fetch(origin+path,{redirect:"manual"});
  assert.equal(r.status,401,`${path} must reject anonymous access`);
 }
 // Forged cookies must never grant access, even when their payload mentions a user.
 const forged=Buffer.from(JSON.stringify({userId:"default-user",exp:Math.floor(Date.now()/1000)+3600})).toString("base64url")+".invalid";
 for(const path of ["/contacts","/api/contacts"]){
  const r=await fetch(origin+path,{redirect:"manual",headers:{cookie:"prospector_session="+forged,"x-user-id":"default-user"}});
  assert.equal(r.status,path.startsWith("/api/")?401:307,`${path} accepted a forged cookie or identity header`);
 }
 // Login must reject malformed JSON without disclosing information.
 const bad=await fetch(origin+"/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:"{"});
 assert.equal(bad.status,400,"Malformed login request must return 400");
 console.log("PASS: 11 pages redirect, 3 APIs reject anonymous, forged cookie rejected, malformed login rejected");
}finally{server.kill();}
