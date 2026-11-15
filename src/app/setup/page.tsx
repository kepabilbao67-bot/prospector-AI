"use client";
import { FormEvent, useState } from "react";

export default function SetupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  function generatePassword() {
    const bytes = crypto.getRandomValues(new Uint8Array(24));
    setPassword(Array.from(bytes, b => b.toString(16).padStart(2, "0")).join(""));
    setShow(true);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/setup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "same-origin", body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Alta no disponible"); return; }
      window.location.assign("/contacts");
    } catch { setError("No se pudo establecer la cuenta local"); }
    finally { setBusy(false); }
  }
  return <main className="min-h-screen flex items-center justify-center p-6">
    <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-xl border bg-white p-8 shadow">
      <h1 className="text-2xl font-semibold">Activar Prospectoría 360</h1>
      <p className="text-sm text-gray-600">Crea una sola cuenta de propietario en el portátil KEPA. Tus contactos permanecen en el CRM de Kepa.</p>
      <label className="block text-sm">Tu correo
        <input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded border p-3"/>
      </label>
      <label className="block text-sm">Contraseña segura (mínimo 16 caracteres)
        <div className="mt-1 flex gap-2">
          <input required type={show ? "text" : "password"} minLength={16} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} className="min-w-0 flex-1 rounded border p-3"/>
          <button type="button" onClick={()=>setShow(!show)} className="rounded border px-3">{show ? "Ocultar" : "Ver"}</button>
        </div>
        <button type="button" onClick={generatePassword} className="mt-2 rounded border px-3 py-2 text-sm text-blue-700">Generar contraseña segura</button>
        <p className="mt-1 text-xs text-gray-500">Guarda la contraseña en el gestor del navegador para futuros accesos.</p>
      </label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={busy} className="w-full rounded bg-blue-700 p-3 font-semibold text-white disabled:opacity-60">{busy ? "Activando..." : "Activar cuenta"}</button>
    </form>
  </main>;
}
