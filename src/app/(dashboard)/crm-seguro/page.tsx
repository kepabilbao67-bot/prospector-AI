"use client";
import { useState } from "react";
type Contact={id:string;first_name:string;company:string|null;phone:string|null;email:string|null;status:string;notes:string|null};
type AuthResponse={access_token?:string;user?:{id:string;email:string};error_description?:string;msg?:string};
const URL_BASE=process.env.NEXT_PUBLIC_SUPABASE_URL||"";
const API_KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||"";
const statuses=["new","contacted","replied","qualified","converted","lost"];
export default function CrmSeguroPage(){
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [token,setToken]=useState("");
 const [mode,setMode]=useState<"login"|"signup">("login");
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState("");
 const [contacts,setContacts]=useState<Contact[]>([]);
 const [form,setForm]=useState({first_name:"",company:"",phone:"",email:"",notes:""});
 const [query,setQuery]=useState("");
 const configured=Boolean(URL_BASE&&API_KEY);
 function headers(access=token){return {apikey:API_KEY,Authorization:"Bearer "+access,"Content-Type":"application/json"};}
 async function list(access=token){
   const r=await fetch(URL_BASE+"/rest/v1/prospector_contacts?select=id,first_name,company,phone,email,status,notes&order=created_at.desc&limit=1000",{headers:headers(access),cache:"no-store"});
   const data=await r.json();
   if(!r.ok)throw new Error(data.message||"No se pudieron consultar los contactos.");
   setContacts(data);
 }
 async function authenticate(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();if(!configured)return;
  setBusy(true);setNotice("");
  try{
   const endpoint=mode==="signup"?"/auth/v1/signup":"/auth/v1/token?grant_type=password";
   const r=await fetch(URL_BASE+endpoint,{method:"POST",headers:{apikey:API_KEY,"Content-Type":"application/json"},body:JSON.stringify({email,password})});
   const data:AuthResponse=await r.json();
   if(!r.ok)throw new Error(data.error_description||data.msg||"Error de autenticación");
   if(!data.access_token){setNotice("Comprueba tu correo electrónico para confirmar la cuenta. Después inicia sesión.");setMode("login");return;}
   setToken(data.access_token);setPassword("");await list(data.access_token);setNotice("Conectado a tu CRM privado.");
  }catch(error){setNotice(error instanceof Error?error.message:"No se pudo acceder.");}
  finally{setBusy(false);}
 }
 async function save(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();if(!token)return;
  if(!form.first_name.trim()&&!form.company.trim()){setNotice("Indica nombre o empresa.");return;}
  setBusy(true);setNotice("");
  try{
   const user=await fetch(URL_BASE+"/auth/v1/user",{headers:headers()});
   if(!user.ok)throw new Error("La sesión ha caducado. Vuelve a entrar.");
   const profile=await user.json();
   const r=await fetch(URL_BASE+"/rest/v1/prospector_contacts",{method:"POST",headers:{...headers(),Prefer:"return=minimal"},body:JSON.stringify({...form,first_name:form.first_name.trim()||form.company.trim(),user_id:profile.id})});
   if(!r.ok){const data=await r.json();throw new Error(data.message||"No se pudo guardar.");}
   setForm({first_name:"",company:"",phone:"",email:"",notes:""});await list();setNotice("Contacto guardado en la base privada.");
  }catch(error){setNotice(error instanceof Error?error.message:"Error al guardar");}
  finally{setBusy(false);}
 }
 async function change(id:string,status:string){
  try{
   const r=await fetch(URL_BASE+"/rest/v1/prospector_contacts?id=eq."+encodeURIComponent(id),{method:"PATCH",headers:{...headers(),Prefer:"return=minimal"},body:JSON.stringify({status})});
   if(!r.ok)throw new Error("No se pudo actualizar.");
   await list();
  }catch(error){setNotice(error instanceof Error?error.message:"Error");}
 }
 function compose(c:Contact){
  try{sessionStorage.setItem("prospector:selected-contact:v1",JSON.stringify({name:c.first_name,company:c.company||"",phone:c.phone||"",email:c.email||""}));}
  catch{setNotice("No se pudo preparar el borrador del contacto.");}
  window.location.assign("/buscar-empresas");
 }
 const filtered=contacts.filter(c=>[c.first_name,c.company,c.phone,c.email].some(v=>(v||"").toLowerCase().includes(query.toLowerCase())));
 return <section className="mx-auto max-w-4xl space-y-5 p-4">
  <h1 className="text-2xl font-semibold">CRM seguro · Prospector IA 360</h1>
  <p className="text-sm text-gray-600">Contactos separados por usuario mediante Supabase Auth y políticas RLS. Ningún mensaje se envía automáticamente.</p>
  {!configured?<p role="alert">La conexión de Supabase no está configurada para este despliegue.</p>:
  !token?<form onSubmit={authenticate} className="space-y-3 rounded-xl border bg-white p-5">
   <h2 className="font-semibold">{mode==="signup"?"Crear cuenta":"Iniciar sesión"}</h2>
   <label className="block text-sm">Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded border p-2" autoComplete="username"/></label>
   <label className="block text-sm">Contraseña<input required type="password" minLength={6} value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full rounded border p-2" autoComplete={mode==="signup"?"new-password":"current-password"}/></label>
   <button disabled={busy} className="rounded-lg bg-gray-900 px-4 py-2 text-white disabled:opacity-50">{busy?"Comprobando…":mode==="signup"?"Registrar":"Entrar"}</button>
   <button type="button" onClick={()=>setMode(mode==="signup"?"login":"signup")} className="ml-3 text-sm underline">{mode==="signup"?"Ya tengo cuenta":"Crear cuenta"}</button>
  </form>:<>
   <div className="flex justify-end"><button type="button" className="text-sm underline" onClick={()=>{setToken("");setContacts([]);setNotice("Sesión cerrada en esta pestaña.");}}>Cerrar sesión local</button></div>
   <form onSubmit={save} className="grid gap-3 rounded-xl border bg-white p-5 sm:grid-cols-2">
    {(["first_name","company","phone","email"] as const).map(k=><label key={k} className="text-sm">{({first_name:"Nombre",company:"Empresa",phone:"Teléfono",email:"Email"})[k]}<input value={form[k]} onChange={e=>setForm(v=>({...v,[k]:e.target.value}))} type={k==="email"?"email":"text"} maxLength={k==="email"?254:120} className="mt-1 w-full rounded border p-2"/></label>)}
    <label className="block text-sm sm:col-span-2">Notas<textarea rows={2} value={form.notes} onChange={e=>setForm(v=>({...v,notes:e.target.value}))} className="mt-1 w-full rounded border p-2"/></label>
    <button disabled={busy} className="rounded-lg bg-gray-900 px-4 py-2 text-white disabled:opacity-50">Guardar contacto</button>
   </form>
   <div className="flex flex-wrap justify-between gap-3"><h2 className="font-semibold">Mis contactos: {contacts.length}</h2><input aria-label="Buscar contactos" placeholder="Buscar" value={query} onChange={e=>setQuery(e.target.value)} className="rounded border p-2"/></div>
   {filtered.map(c=><article className="rounded-xl border bg-white p-4" key={c.id}><h3 className="font-semibold">{c.company||c.first_name}</h3><p className="text-sm">{c.first_name} · {c.phone||"Sin teléfono"} · {c.email||"Sin email"}</p>
    <select className="mt-2 rounded border p-2" value={c.status} onChange={e=>void change(c.id,e.target.value)} aria-label="Estado comercial">{statuses.map(x=><option key={x} value={x}>{x}</option>)}</select>
    <button type="button" className="ml-3 text-sm text-green-800 underline" onClick={()=>compose(c)}>Preparar WhatsApp o email</button></article>)}
  </>}
  <p role="status" className="text-sm text-gray-600">{notice}</p>
  <p className="text-xs text-gray-500">La sesión se mantiene en memoria de esta pestaña; al recargar hay que iniciar sesión de nuevo. La conexión a WhatsApp Business y LinkedIn sigue siendo manual hasta autorizar sus cuentas.</p>
 </section>;
}
