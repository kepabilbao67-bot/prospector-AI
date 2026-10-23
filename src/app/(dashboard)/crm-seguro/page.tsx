"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
type C={id:string;firstName:string;company:string|null;phone:string|null;email:string|null;status:string};
export default function SecureCrm(){
 const [contacts,setContacts]=useState<C[]>([]);
 const [form,setForm]=useState({firstName:"",company:"",phone:"",email:""});
 const [status,setStatus]=useState("Cargando...");
 const [unauthorized,setUnauthorized]=useState(false);
 async function refresh(){
  try{const r=await fetch("/api/contacts",{cache:"no-store"});if(r.status===401){setUnauthorized(true);return}
   const d=await r.json();if(!r.ok)throw Error(d.error||"Error de CRM");
   setContacts(d.contacts);setStatus("");
  }catch(e){setStatus(e instanceof Error?e.message:"No disponible")}
 }
 useEffect(()=>{void refresh()},[]);
 async function save(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setStatus("Guardando...");
  try{const r=await fetch("/api/contacts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,network:"other"})});
   const d=await r.json();if(!r.ok)throw Error(d.error||"Error al guardar");
   setForm({firstName:"",company:"",phone:"",email:""});await refresh();setStatus("Guardado.");
  }catch(e){setStatus(e instanceof Error?e.message:"Error")}
 }
 async function changeStatus(c:C,next:string){
  const r=await fetch("/api/contacts/"+encodeURIComponent(c.id),{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:next})});
  if(r.ok)void refresh();else setStatus("No se pudo actualizar.");
 }
 return <main className="mx-auto max-w-4xl space-y-5 p-6">
  <h1 className="text-2xl font-semibold">CRM seguro · Mis contactos</h1>
  {unauthorized?<p><Link className="underline" href="/acceso">Inicia sesión o crea tu cuenta</Link> para registrar contactos privados.</p>:<>
   <form onSubmit={save} className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
    {(["firstName","company","phone","email"] as const).map(k=><label key={k} className="text-sm">{({firstName:"Nombre",company:"Empresa",phone:"Teléfono",email:"Email"})[k]}<input type={k==="email"?"email":"text"} value={form[k]} onChange={e=>setForm(v=>({...v,[k]:e.target.value}))} className="mt-1 w-full rounded border p-2"/></label>)}
    <button className="rounded-lg bg-gray-900 p-2 text-white">Guardar contacto</button>
   </form>
   <p role="status" className="text-sm">{status}</p>
   <h2 className="font-semibold">Contactos: {contacts.length}</h2>
   {contacts.map(c=><article key={c.id} className="rounded-xl border p-3"><p className="font-semibold">{c.company||c.firstName}</p><p className="text-sm">{c.firstName} · {c.phone||"Sin teléfono"} · {c.email||"Sin correo"}</p>
    <select aria-label="Estado comercial" value={c.status} onChange={e=>void changeStatus(c,e.target.value)} className="my-2 rounded border p-2">
    {["new","contacted","replied","qualified","converted","lost"].map(x=><option key={x} value={x}>{x}</option>)}</select>
   </article>)}
  </>}
  <p className="text-xs text-gray-600">No uses información real hasta que se verifique la base de datos persistente, el acceso y las políticas de seguridad.</p>
 </main>;
}
