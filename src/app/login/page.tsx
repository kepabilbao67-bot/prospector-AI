"use client";
import {Suspense,useState,type FormEvent} from "react";
import {useRouter,useSearchParams} from "next/navigation";
function LoginForm(){
 const router=useRouter(),params=useSearchParams(),from=params.get("from")||"/";
 const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[error,setError]=useState(""),[loading,setLoading]=useState(false);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setError("");setLoading(true);
  try{
   const response=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify({email,password})});
   if(!response.ok)throw new Error(response.status===401?"Credenciales inválidas":"Servicio de autenticación no disponible");
   const result=await response.json();if(result?.ok!==true)throw new Error("No se pudo verificar el acceso");
   // Limit navigation to a relative, local pathname. Reject URL schemes, backslashes and auth loops.
   const safe=from.startsWith("/")&&!from.startsWith("//")&&!from.includes("\\")&&!from.includes("\r")&&!from.includes("\n")&&!from.startsWith("/login")?from:"/";
   router.replace(safe);router.refresh();
  }catch(e){setError(e instanceof Error?e.message:"Error de conexión");setLoading(false);}
 }
 return <form onSubmit={submit} className="space-y-4">
  {error&&<p role="alert" className="rounded-lg border border-rose-700 bg-rose-950 p-3 text-sm text-rose-200">{error}</p>}
  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300">Correo del operador<input className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white" type="email" required autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)}/></label>
  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300">Contraseña<input className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white" type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label>
  <button disabled={loading} className="w-full rounded-lg bg-indigo-600 p-3 text-sm font-bold text-white disabled:opacity-50">{loading?"Verificando sesión…":"Iniciar sesión segura"}</button>
 </form>;
}
export default function LoginPage(){
 return <main className="flex min-h-screen items-center justify-center bg-slate-950 p-5 text-white"><section className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-7 shadow-2xl">
  <div className="border-b border-slate-700 pb-5"><p className="text-xs font-bold uppercase tracking-widest text-indigo-400">Prospector IA 360 + Publicidad 360</p><h1 className="mt-3 text-2xl font-extrabold">Acceso protegido</h1><p className="mt-2 text-sm text-slate-400">Solo usuarios existentes. Sesión firmada en cookie HttpOnly; acceso a datos sujeto a autorización del servidor.</p></div>
  <Suspense fallback={<p className="text-sm text-slate-400">Cargando formulario…</p>}><LoginForm/></Suspense>
  <p className="border-t border-slate-700 pt-4 text-xs text-slate-500">Protección por defecto · No existe registro público</p>
 </section></main>;
}
