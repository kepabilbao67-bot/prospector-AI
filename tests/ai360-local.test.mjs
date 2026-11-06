import test from "node:test";
import assert from "node:assert/strict";
import { askApis360Local, apis360LocalAvailable } from "../src/lib/apis360-local.ts";

function response(data, ok=true) {
  return { ok, json: async () => data };
}

test("Gateway local exige estado local y proyecto sin cloud", async () => {
  const calls=[];
  const fetcher=async (url, opts) => {
    calls.push({url, opts});
    if(url.endsWith("/v1/status")) return response({
      service:"apis360",localOnly:true,ai:{local:{available:true,modelInstalled:true}}
    });
    return response({
      id:"prospector360",mode:"local",allowCloudExplicit:false,
      allowAutomaticCloudFallback:false
    });
  };
  assert.equal(await apis360LocalAvailable(fetcher),true);
  assert.deepEqual(calls.map(x=>x.url),[
    "http://127.0.0.1:3737/v1/status",
    "http://127.0.0.1:3737/v1/projects/prospector360",
  ]);
});

test("Cualquier proyecto cloud, gateway caído o modelo sin instalar se rechaza",async()=>{
  const cloud=async(url)=>response(url.endsWith("/v1/status")?{
    service:"apis360",localOnly:true,ai:{local:{available:true,modelInstalled:true}}
  }:{
    id:"prospector360",mode:"auto",allowCloudExplicit:true,
    allowAutomaticCloudFallback:false
  });
  assert.equal(await apis360LocalAvailable(cloud),false);
  assert.equal(await apis360LocalAvailable(async()=>{throw new Error("offline")}),false);
});

test("Solicitud incluye proyecto, modo local y no comparte credenciales",async()=>{
  let sent;
  const fetcher=async(url,opts)=>{
    sent={url,opts};
    return response({source:"local",cost:{requestUsd:0},recommendation:{text:"Borrador generado"}});
  };
  assert.equal(await askApis360Local("Escribe borrador",fetcher),"Borrador generado");
  assert.equal(sent.url,"http://127.0.0.1:3737/v1/ai/ask");
  assert.deepEqual(JSON.parse(sent.opts.body),{
    project:"prospector360",mode:"local",prompt:"Escribe borrador"
  });
  assert.equal(sent.opts.headers["x-kepa-project"],"prospector360");
  assert.equal(sent.opts.headers.Authorization,undefined);
});

test("Respuestas cloud, con coste o vacías fallan cerrado",async()=>{
  for(const doc of [
    {source:"cloud",cost:{requestUsd:0},recommendation:{text:"Cloud"}},
    {source:"local",cost:{requestUsd:0.1},recommendation:{text:"Coste"}},
    {source:"local",cost:{requestUsd:0},recommendation:{text:""}},
    {source:"local",recommendation:{text:"Sin coste verificado"}}
  ]){
    await assert.rejects(()=>askApis360Local("hola",async()=>response(doc)),/AI360_NOT_VERIFIED_LOCAL/);
  }
});

test("Errores HTTP y prompts inválidos no activan fallback cloud",async()=>{
  await assert.rejects(()=>askApis360Local("hola",async()=>response({},false)),/AI360_GATEWAY_UNAVAILABLE/);
  await assert.rejects(()=>askApis360Local(""),/AI360_INVALID_PROMPT/);
  await assert.rejects(()=>askApis360Local("x".repeat(6001)),/AI360_INVALID_PROMPT/);
});
