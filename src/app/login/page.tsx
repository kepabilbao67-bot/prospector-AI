"use client";
import { FormEvent, useState } from "react";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        setError(response.status === 503 ? "Acceso pendiente de configurar: contacta con el administrador." : "Credenciales incorrectas.");
        return;
      }
      window.location.assign("/contacts");
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setBusy(false);
    }
  }
  return <main className="min-h-screen flex items-center justify-center p-6">
    <form onSubmit={submit} className="w-full max-w-sm rounded-xl border bg-white p-8 shadow-sm space-y-5">
      <h1 className="text-2xl font-bold">Prospectoría 360</h1>
      <p className="text-sm text-gray-600">Accede a tu CRM protegido.</p>
      <label className="block text-sm">Correo electrónico
        <input required type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 block w-full rounded border p-3"/>
      </label>
      <label className="block text-sm">Contraseña
        <input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 block w-full rounded border p-3"/>
      </label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button disabled={busy} type="submit" className="w-full rounded bg-blue-700 p-3 font-semibold text-white disabled:opacity-50">{busy ? "Comprobando..." : "Entrar"}</button>
      <a href="/activate" className="block text-center text-sm text-blue-700 underline">Activar mi cuenta de Vercel</a>
      <a href="/setup" className="block text-center text-xs text-gray-500 underline">Primera activación local (solo portátil)</a>
    </form>
  </main>;
}
