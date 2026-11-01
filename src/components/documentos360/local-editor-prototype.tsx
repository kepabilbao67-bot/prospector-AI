"use client";

import { useRef, useState } from "react";

export default function Documentos360Page() {
  const editor = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("Documento");
  const [message, setMessage] = useState("Edición local: no se envían archivos al CRM ni al servidor.");

  async function openFile(file?: File) {
    if (!file || !editor.current) return;
    if (!/\.(txt|html?)$/i.test(file.name)) { setMessage("Solo TXT o HTML. Para PDF usa el visor de tu dispositivo."); return; }
    if (file.size > 2_000_000) { setMessage("Archivo demasiado grande (máximo 2 MB)."); return; }
    const content = await file.text();
    setName(file.name.replace(/\.[^.]+$/, ""));
    // Text-only import: never execute HTML supplied by a document.
    editor.current.textContent = content;
    setMessage("Archivo cargado localmente. El original no se ha modificado.");
  }

  function download() {
    const content = editor.current?.innerText || "";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (name.trim().replace(/[^a-z0-9._ -]/gi, "_") || "documento") + ".txt";
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Copia TXT descargada. Comprueba la carpeta Descargas.");
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Documentos 360 — editor local</h1>
        <p className="text-sm text-slate-600">Módulo preliminar de edición. Sin sincronización, almacenamiento en servidor ni acceso a documentos del CRM.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-slate-700">Nombre <input className="ml-2 rounded border p-2" aria-label="Nombre del documento" value={name} onChange={e => setName(e.target.value)} /></label>
        <label className="rounded border p-2 text-sm cursor-pointer">Abrir TXT/HTML <input className="sr-only" type="file" accept=".txt,.html,.htm,text/plain,text/html" onChange={e => void openFile(e.target.files?.[0])}/></label>
        <button className="rounded bg-indigo-700 px-4 py-2 text-white" onClick={download}>Guardar TXT</button>
        <button className="rounded border px-4 py-2" onClick={() => window.print()}>Imprimir / PDF</button>
      </div>
      <div ref={editor} role="textbox" aria-label="Editor de documentos" aria-multiline="true" contentEditable suppressContentEditableWarning className="min-h-[420px] whitespace-pre-wrap rounded bg-white p-8 text-slate-900 shadow ring-1 ring-slate-200" />
      <p role="status" className="text-sm text-slate-600">{message}</p>
    </section>
  );
}
