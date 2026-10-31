export const SESSION_COOKIE = "prospector_session";
export const SESSION_MAX_AGE = 60 * 60 * 8;
export type Session = { userId: string; exp: number };
const encoder = new TextEncoder();
function getSecret(): string | null { const secret = process.env.AUTH_SECRET; return secret && encoder.encode(secret).length >= 32 ? secret : null; }
function base64url(bytes: Uint8Array): string { let s = ""; for (const b of bytes) s += String.fromCharCode(b); return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); }
function decode(value:string): Uint8Array { if(!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error("Invalid base64url");const s=atob(value.replace(/-/g,"+").replace(/_/g,"/")+"=".repeat((4-value.length%4)%4));return Uint8Array.from(s,c=>c.charCodeAt(0)); }
async function key(secret:string){ return crypto.subtle.importKey("raw",encoder.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign","verify"]); }
export async function createSession(userId:string):Promise<string>{
 const secret=getSecret();if(!secret)throw new Error("AUTH_SECRET missing or too short");
 if(!/^[A-Za-z0-9_-]{3,128}$/.test(userId))throw new Error("Invalid userId");
 const data=base64url(encoder.encode(JSON.stringify({userId,exp:Math.floor(Date.now()/1000)+SESSION_MAX_AGE})));
 const signature=await crypto.subtle.sign("HMAC",await key(secret),encoder.encode(data));
 return data+"."+base64url(new Uint8Array(signature));
}
export async function verifySession(token:string|null|undefined):Promise<Session|null>{
 const secret=getSecret();if(!secret||!token||token.length>2048)return null;
 const parts=token.split(".");if(parts.length!==2)return null;
 try{
  const [data,signature]=parts;
  const valid=await crypto.subtle.verify("HMAC",await key(secret),decode(signature),encoder.encode(data));
  if(!valid)return null;
  const value:unknown=JSON.parse(new TextDecoder().decode(decode(data)));
  if(!value||typeof value!=="object")return null;
  const obj=value as Partial<Session>,now=Math.floor(Date.now()/1000);
  if(typeof obj.userId!=="string"||!/^[A-Za-z0-9_-]{3,128}$/.test(obj.userId)||typeof obj.exp!=="number"||!Number.isSafeInteger(obj.exp)||obj.exp<=now||obj.exp>now+SESSION_MAX_AGE)return null;
  return {userId:obj.userId,exp:obj.exp};
 }catch{return null;}
}
