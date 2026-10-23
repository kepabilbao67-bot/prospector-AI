"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function AccessPage() {
 const router = useRouter();
 const [mode,setMode] = useState<"login"|"register">("login");
 const [name,setName] = useState("");
 const [email,setEmail] = useState("");
 const [password,setPassword] = useState("");
 const [busy,setBusy] = useState(false);
 const [error,setError] = useState("");
 async function submit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault(); setBusy(true); setError("");
  try {
   const response = await fetch("/api/auth/"+mode,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify({name,email,password})});
   const payload = await response.json();
   if(!response.ok) throw new Error(payload.error || "Error de acceso");
   router.push("/contacts"); router.refresh();
  } catch(e) {setError(e instanceof Error?e.message:"Error de acceso");}
  finally {setBusy(false);}
 }
 return <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center space-y-5 p-6">
  <h1 className="text-3xl font-semibold">Prospector IA 360</h1>
  <p className="text-sm text-gray-600">Acceso a tu CRM privado. Las conexiones a otras plataformas se autorizan por separado.</p>
  <form className="space-y-4 rounded-xl border bg-white p-6" onSubmit={submit}>
   <h2 className="font-semibold">{mode==="register"?"Crear cuenta":"Iniciar sesión"}</h2>
   {mode==="register"&&<label className="block text-sm">Nombre<input required maxLength={120} value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full rounded-lg border p-3"/></label>}
   <label className="block text-sm">Correo electrónico<input required type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded-lg border p-3"/></label>
   <label className="block text-sm">Contraseña (mínimo 12 caracteres)<input required minLength={mode==="register"?12:1} maxLength={128} type="password" autoComplete={mode==="register"?"new-password":"current-password"} value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full rounded-lg border p-3"/></label>
   {error&&<p role="alert" className="text-sm text-red-700">{error}</p>}
   <button disabled={busy} className="w-full rounded-lg bg-gray-900 p-3 text-white disabled:opacity-50">{busy?"Comprobando...":mode==="register"?"Crear cuenta":"Entrar"}</button>
   <button type="button" className="w-full text-sm text-blue-700" onClick={()=>{setError("");setMode(mode==="register"?"login":"register")}}>{mode==="register"?"Ya tengo cuenta":"Crear una cuenta nueva"}</button>
  </form>
  <p className="text-xs text-gray-500">El inicio de sesión solo funciona cuando el servidor tiene configurados SESSION_SECRET y una base de datos persistente.</p>
 </main>;
}
