"use client";

import { useEffect, useState } from "react";

type Network = "linkedin" | "instagram" | "facebook" | "google";
type Draft = { id: string; network: Network; product: string; title: string; body: string; createdAt: string };

const services: Record<string, { label: string; problem: string; solution: string }> = {
  all: {
    label: "Kepa Tecnología 360 · Toda la empresa",
    problem: "reducir trabajo repetitivo y organizar mejor su actividad",
    solution: "aplicaciones empresariales, asistentes de IA y automatización adaptada a cada necesidad",
  },
  llamadas: {
    label: "Llamadas 360",
    problem: "atender llamadas y dar seguimiento a contactos",
    solution: "un asistente telefónico con IA y herramientas de gestión de contactos",
  },
  fincas: {
    label: "Fincas 360",
    problem: "organizar la administración de comunidades",
    solution: "herramientas digitales para administradores de fincas",
  },
  autonomo: {
    label: "Autónomo 360",
    problem: "gestionar tareas administrativas del día a día",
    solution: "herramientas de gestión pensadas para autónomos",
  },
  electricista: {
    label: "Electricista 360",
    problem: "organizar trabajos y documentación técnica",
    solution: "herramientas de gestión para profesionales de electricidad",
  },
  prospector: {
    label: "Prospector 360",
    problem: "organizar la captación y el seguimiento comercial",
    solution: "un CRM y herramientas de prospección empresarial",
  },
};

const networks: { id: Network; label: string }[] = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "google", label: "Perfil de Empresa de Google" },
];

function createDrafts(product: string, network: Network, area: string, sector: string, website: string): Draft[] {
  const selected = services[product] || services.all;
  const place = area.trim() || "Bizkaia";
  const audience = sector.trim() || "empresas y profesionales";
  const intro = selected.label + " | Kepa Tecnología";
  const problem = selected.problem;
  const solution = selected.solution;
  const link = website.trim() && /^https?:\/\/\S+$/i.test(website.trim()) ? "\n" + website.trim() : "";
  const endings: Record<Network, string> = {
    linkedin: "\n\n¿Te interesa valorar una solución para tu empresa? Escríbeme y lo vemos.",
    instagram: "\n\n📩 Escríbenos y te mostramos cómo funciona. #KepaTecnologia #Bizkaia",
    facebook: "\n\nEnvíanos un mensaje para conocer las opciones disponibles.",
    google: "\n\nContacta con Kepa Tecnología para solicitar información.",
  };
  const variants = [
    {
      title: "Menos tareas repetitivas",
      body: "¿Tu actividad necesita una forma más sencilla de " + problem + "? En Kepa Tecnología desarrollamos " + solution + " para " + audience + " de " + place + ".",
    },
    {
      title: "Tecnología para tu negocio",
      body: "En " + place + ", " + audience + " pueden descubrir nuevas formas de trabajar con " + intro + ". Nuestro enfoque: " + solution + ".",
    },
    {
      title: "Conoce Kepa Tecnología 360",
      body: "Cada negocio tiene necesidades distintas. Si buscas " + problem + ", conoce " + selected.label + " y descubre si nuestras soluciones encajan con tu actividad en " + place + ".",
    },
  ];
  const createdAt = new Date().toISOString();
  return variants.map((draft, index) => ({
    id: createdAt + "-" + index,
    product: selected.label,
    network,
    title: draft.title,
    body: draft.body + endings[network] + link,
    createdAt,
  }));
}

const storageKey = "prospector360-marketing-gratis-drafts-v1";

export default function MarketingGratisPage() {
  const [product, setProduct] = useState("all");
  const [network, setNetwork] = useState<Network>("linkedin");
  const [area, setArea] = useState("Bilbao y Bizkaia");
  const [sector, setSector] = useState("pymes, autónomos y administradores de fincas");
  const [website, setWebsite] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (!saved) return;
      const parsed: unknown = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        setDrafts(parsed.filter((item): item is Draft =>
          typeof item === "object" && item !== null &&
          typeof item.id === "string" && typeof item.title === "string" &&
          typeof item.body === "string" && typeof item.network === "string"
        ).slice(0, 3));
      }
    } catch {
      // Los borradores también funcionan sin almacenamiento del navegador.
    }
  }, []);

  function generate() {
    const next = createDrafts(product, network, area, sector, website);
    setDrafts(next);
    setGenerated(true);
    setCopied(null);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Sin almacenamiento, los borradores siguen disponibles en esta pestaña.
    }
  }

  async function copy(draft: Draft) {
    try {
      await navigator.clipboard.writeText(draft.title + "\n\n" + draft.body);
      setCopied(draft.id);
    } catch {
      setCopied(null);
      window.alert("No se pudo copiar automáticamente. Selecciona el texto y cópialo.");
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Prospector 360</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Marketing orgánico gratis</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Prepara publicaciones para Kepa Tecnología sin contratar anuncios, servicios externos de IA ni cuentas de pago.
          Generador basado en plantillas locales: no envía mensajes ni publica automáticamente.
        </p>
      </div>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
        <label className="space-y-1.5 text-sm font-medium text-slate-700">
          <span>Qué quieres promocionar</span>
          <select value={product} onChange={(e) => setProduct(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm">
            {Object.entries(services).map(([id, service]) => (
              <option key={id} value={id}>{service.label}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5 text-sm font-medium text-slate-700">
          <span>Red donde preparar el contenido</span>
          <select value={network} onChange={(e) => setNetwork(e.target.value as Network)}
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm">
            {networks.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
        <label className="space-y-1.5 text-sm font-medium text-slate-700">
          <span>Zona comercial</span>
          <input value={area} maxLength={100} onChange={(e) => setArea(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-3 text-sm" />
        </label>
        <label className="space-y-1.5 text-sm font-medium text-slate-700">
          <span>Cliente objetivo</span>
          <input value={sector} maxLength={120} onChange={(e) => setSector(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-3 text-sm" />
        </label>
        <label className="space-y-1.5 text-sm font-medium text-slate-700 md:col-span-2">
          <span>Enlace web de destino (opcional)</span>
          <input type="url" placeholder="https://tuweb.es" value={website} maxLength={500}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-3 text-sm" />
        </label>
        <div className="flex flex-col gap-2 md:col-span-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">No solicita pagos, no conecta con plataformas publicitarias y no usa API de IA.</p>
          <button type="button" onClick={generate}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
            Generar 3 publicaciones gratis
          </button>
        </div>
      </section>

      {drafts.length > 0 ? (
        <section className="space-y-3" aria-live="polite">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Tus borradores</h2>
            <p className="text-xs text-slate-500">
              {generated ? "Nuevas variantes preparadas." : "Borradores recuperados de este navegador."}
              {" "}No se han enviado ni publicado.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {drafts.map((draft, index) => (
              <article key={draft.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  Variante {index + 1} · {networks.find((item) => item.id === draft.network)?.label || draft.network}
                </div>
                <h3 className="text-base font-semibold text-slate-900">{draft.title}</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{draft.body}</p>
                <button type="button" onClick={() => copy(draft)}
                  className="mt-auto rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100">
                  {copied === draft.id ? "Copiado" : "Copiar publicación"}
                </button>
              </article>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            Estos borradores se guardan solo en este navegador. Para publicarlos, revísalos primero
            y utiliza tu cuenta de la red social. No hay publicación automática.
          </p>
        </section>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          Elige un servicio y genera tres propuestas listas para revisar.
        </div>
      )}
    </div>
  );
}
