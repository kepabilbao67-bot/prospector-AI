import { createHmac, timingSafeEqual } from "node:crypto";
export const SESSION_COOKIE = "prospector_session";
const MAX_AGE = 60 * 60 * 8;
type Session = {userId:string;exp:number};
function secret(): string | null { const s=process.env.AUTH_SECRET; return s && s.length>=32 ? s : null; }
export function createSession(userId:string):string {
 const s=secret(); if(!s) throw new Error("AUTH_SECRET must have at least 32 characters");
 if(!/^[a-zA-Z0-9_-]{3,128}$/.test(userId)) throw new Error("Invalid user ID");
 const data=Buffer.from(JSON.stringify({userId,exp:Math.floor(Date.now()/1000)+MAX_AGE})).toString("base64url");
 const sig=createHmac("sha256",s).update(data).digest("base64url");
 return data+"."+sig;
}
export function verifySession(token:string|undefined|null):Session|null {
 const s=secret(); if(!s||!token||token.length>2048)return null;
 const parts=token.split(".");if(parts.length!==2)return null;
 const [data,sig]=parts;
 const expected=createHmac("sha256",s).update(data).digest();
 let supplied:Buffer;
 try { supplied=Buffer.from(sig,"base64url"); }catch{return null;}
 if(supplied.length!==expected.length||!timingSafeEqual(supplied,expected))return null;
 try {
  const obj:unknown=JSON.parse(Buffer.from(data,"base64url").toString());
  if(!obj||typeof obj!=="object")return null;
  const v=obj as Partial<Session>;
  if(typeof v.userId!=="string"||!/^[a-zA-Z0-9_-]{3,128}$/.test(v.userId)||typeof v.exp!=="number"||!Number.isSafeInteger(v.exp)||v.exp<=Math.floor(Date.now()/1000)||v.exp>Math.floor(Date.now()/1000)+MAX_AGE)return null;
  return {userId:v.userId,exp:v.exp};
 }catch{return null;}
}
export const SESSION_MAX_AGE=MAX_AGE;
