"use client";
import { FormEvent, useState } from "react";
export default function ActivatePage() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [show,setShow]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [sent,setSent]=useState(false);
  function generate() {
    const bytes = crypto.getRandomValues(new Uint8Array(24));
    setPassword(Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join(""));
    setShow(true);
  }
  async function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();setBusy(true);setError("");
    try {
      const response=await fetch("/api/auth/register",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email,password})
      });
      const result=await response.json();
      if(!response.ok) setError(result.error || "Alta no disponible");
      else setSent(true);
    } catch {setError("No hay conexión con el servicio de alta");}
    finally {setBusy(false);}
  }
  return <main className="min-h-screen flex items-center justify-center p-6">
    <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow space-y-5">
      <h1 className="text-2xl font-bold">Activar Prospectoría 360 en Vercel</h1>
      {sent ? <>
        <p role="status">Solicitud aceptada. Consulta tu correo y confirma la cuenta antes de iniciar sesión. Si ya tenías una cuenta, utiliza su contraseña existente.</p>
        <a href="/login" className="text-blue-700 underline">Ir a iniciar sesión</a>
      </> : <form onSubmit={submit} className="space-y-5">
        <p className="text-sm text-gray-600">Alta exclusiva para el propietario. Los contactos permanecen en el CRM de Kepa.</p>
        <label className="block text-sm">Correo del propietario
          <input required type="email" autoComplete="email" className="block mt-1 w-full border rounded p-3" value={email} onChange={e=>setEmail(e.target.value)}/>
        </label>
        <label className="block text-sm">Contraseña (mínimo 20 caracteres)
          <input required minLength={20} maxLength={256} type={show?"text":"password"} autoComplete="new-password" className="block mt-1 w-full border rounded p-3" value={password} onChange={e=>setPassword(e.target.value)}/>
        </label>
        <button type="button" onClick={generate} className="rounded border px-3 py-2 text-sm">Generar contraseña segura</button>
        <button type="button" onClick={()=>setShow(!show)} className="ml-2 text-sm underline">{show?"Ocultar":"Ver"}</button>
        <p className="text-xs text-gray-500">Guarda la contraseña en el gestor del navegador. No se almacenará en esta página.</p>
        {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}
        <button disabled={busy} type="submit" className="block w-full rounded bg-blue-700 p-3 font-semibold text-white disabled:opacity-50">{busy?"Comprobando...":"Activar y enviar confirmación"}</button>
        <a href="/login" className="block text-center text-blue-700 underline">Ya tengo cuenta</a>
      </form>}
    </div>
  </main>;
}
