"use client";

import { useEffect, useState } from "react";

type Step = "objective" | "network" | "product" | "tone" | "generating" | "result";

interface WizardData {
  objective: string;
  network: string;
  product: { name: string; description: string; price: string; benefits: string[] };
  tone: string;
  effort: string;
}

interface GeneratedCampaign {
  name: string;
  steps: { type: string; network: string; delayHours: number; description: string }[];
  settings: { dailyLimit: number; startHour: number; endHour: number };
  tips: string[];
  messages: string[];
}

const networkLabels: Record<string, string> = {
  linkedin: "LinkedIn", fiverr: "Fiverr", instagram: "Instagram", twitter: "Twitter/X",
  facebook: "Facebook", email: "Email", whatsapp: "WhatsApp", tiktok: "TikTok",
};

export default function WizardPage() {
  const [step, setStep] = useState<Step>("objective");
  const [data, setData] = useState<WizardData>({
    objective: "", network: "",
    product: { name: "", description: "", price: "", benefits: [] },
    tone: "professional", effort: "medium",
  });
  const [result, setResult] = useState<GeneratedCampaign | null>(null);
  const [benefitInput, setBenefitInput] = useState("");
  const [generationError, setGenerationError] = useState("");
  const [ai360Available, setAi360Available] = useState(false);
  const [useAi360, setUseAi360] = useState(false);
  const [ai360Notice, setAi360Notice] = useState("");
  useEffect(() => {
    let mounted = true;
    fetch("/api/ai360", { cache: "no-store" })
      .then(r => r.ok ? r.json() : { available: false })
      .then(result => { if (mounted) setAi360Available(result.available === true); })
      .catch(() => { if (mounted) setAi360Available(false); });
    return () => { mounted = false; };
  }, []);

  async function generateCampaign() {
    setGenerationError("");
    setAi360Notice("");
    setStep("generating");
    try {
      const strategyRes = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_strategy", params: { network: data.network, objective: data.objective, product: { name: data.product.name, price: data.product.price }, dailyBudgetTime: data.effort } }),
      });
      if (!strategyRes.ok) throw new Error("No se pudo generar la estrategia.");
      const strategy = await strategyRes.json();
      if (!strategy || typeof strategy.name !== "string" || !Array.isArray(strategy.steps) ||
          !strategy.settings || !Array.isArray(strategy.tips)) throw new Error("Estrategia incompleta.");

      const messages: string[] = [];
      let verifiedAi360 = 0;
      let fallback = false;
      const requestedAi360 = ai360Available && useAi360;
      for (const type of ["first_message", "follow_up", "proposal"]) {
        const context = {
          contact: { firstName: "{{nombre}}", company: "{{empresa}}", jobTitle: "{{cargo}}", network: data.network },
          product: data.product.name ? data.product : undefined,
          tone: data.tone, language: "es", messageType: type,
        };
        let message = "";
        if (requestedAi360 && !fallback) {
          try {
            const aiRes = await fetch("/api/ai360", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "draft_message", context }),
            });
            if (!aiRes.ok) throw new Error("AI360 unavailable");
            const ai = await aiRes.json();
            if (ai.source !== "apis360-local" || ai.costUsd !== 0 || ai.draftOnly !== true ||
                typeof ai.message !== "string" || !ai.message.trim()) {
              throw new Error("AI360 unverified");
            }
            message = ai.message;
            verifiedAi360++;
          } catch {
            fallback = true;
          }
        }
        if (!message) {
          const res = await fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "generate_message", context }),
          });
          if (!res.ok) throw new Error("No se pudo generar uno de los mensajes.");
          const msg = await res.json();
          if (typeof msg.message !== "string") throw new Error("El generador no devolvió mensaje.");
          message = msg.message;
        }
        messages.push(message);
      }
      setAi360Notice(requestedAi360
        ? (fallback
          ? "IA360 dejó de responder: " + verifiedAi360 + " borradores IA y el resto mediante plantillas."
          : "3 borradores generados por APIs360 local. Coste API externo: 0.")
        : "Mensajes generados mediante plantillas locales.");
      setResult({ ...strategy, messages });
      setStep("result");
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "No se pudo generar la campaña.");
      setStep("tone");
    }
  }

  async function saveCampaign() {
    if (!result) return;
    await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: result.name, description: `Generada por IA - ${data.objective}`, network: data.network, settings: result.settings, steps: result.steps.map((s) => ({ type: s.type, network: s.network, delayHours: s.delayHours, config: { description: s.description } })) }),
    });
    alert("Campaña creada correctamente");
  }

  function addBenefit() {
    if (benefitInput.trim()) {
      setData({ ...data, product: { ...data.product, benefits: [...data.product.benefits, benefitInput.trim()] } });
      setBenefitInput("");
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex gap-1 mb-8">
        {["objective", "network", "product", "tone", "result"].map((s, i) => (
          <div key={s} className={`h-1 flex-1 rounded-full transition-all ${["objective","network","product","tone","generating","result"].indexOf(step) >= i ? "bg-gray-900" : "bg-gray-200"}`} />
        ))}
      </div>

      {/* Step: Objective */}
      {step === "objective" && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Objetivo de la campaña</h2>
            <p className="text-sm text-gray-500 mt-1">La IA adaptará la estrategia a tu objetivo</p>
          </div>
          <div className="space-y-2">
            {[
              { id: "get_clients", title: "Conseguir clientes", desc: "Prospección activa para cerrar ventas" },
              { id: "sell_product", title: "Vender un producto o servicio", desc: "Promocionar algo específico" },
              { id: "grow_network", title: "Crecer mi red de contactos", desc: "Más seguidores y conexiones" },
              { id: "brand_awareness", title: "Visibilidad de marca", desc: "Que más gente me conozca" },
            ].map((obj) => (
              <button key={obj.id} onClick={() => { setData({ ...data, objective: obj.id }); setStep("network"); }}
                className={`w-full p-4 rounded-lg border text-left transition-all ${data.objective === obj.id ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}>
                <p className="font-medium text-sm text-gray-900">{obj.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{obj.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step: Network */}
      {step === "network" && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Red social</h2>
            <p className="text-sm text-gray-500 mt-1">Elige dónde están tus clientes potenciales</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(networkLabels).map(([id, name]) => (
              <button key={id} onClick={() => { setData({ ...data, network: id }); setStep("product"); }}
                className={`p-3.5 rounded-lg border text-center text-sm font-medium transition-all ${data.network === id ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}>
                {name}
              </button>
            ))}
          </div>
          <button onClick={() => setStep("objective")} className="text-xs text-gray-400 hover:text-gray-600">Volver</button>
        </div>
      )}

      {/* Step: Product */}
      {step === "product" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Tu producto o servicio</h2>
            <p className="text-sm text-gray-500 mt-1">Opcional. Mejora la personalización de los mensajes.</p>
          </div>
          <input placeholder="Nombre del producto/servicio" value={data.product.name} onChange={(e) => setData({ ...data, product: { ...data.product, name: e.target.value } })}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" />
          <textarea placeholder="Descripción breve" value={data.product.description} onChange={(e) => setData({ ...data, product: { ...data.product, description: e.target.value } })} rows={2}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" />
          <input placeholder="Precio (ej: 497€, desde 99€/mes)" value={data.product.price} onChange={(e) => setData({ ...data, product: { ...data.product, price: e.target.value } })}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" />
          <div className="flex gap-2">
            <input placeholder="Beneficio clave" value={benefitInput} onChange={(e) => setBenefitInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addBenefit()}
              className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" />
            <button onClick={addBenefit} className="px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm">Añadir</button>
          </div>
          {data.product.benefits.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {data.product.benefits.map((b, i) => (
                <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded text-xs">{b}</span>
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <button onClick={() => setStep("network")} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600">Volver</button>
            <button onClick={() => setStep("tone")} className="flex-1 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium">
              {data.product.name ? "Siguiente" : "Omitir"}
            </button>
          </div>
        </div>
      )}

      {/* Step: Tone */}
      {step === "tone" && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Configuración final</h2>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Tono de comunicación</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "professional", label: "Profesional" },
                { id: "casual", label: "Casual" },
                { id: "friendly", label: "Amigable" },
                { id: "direct", label: "Directo" },
                { id: "creative", label: "Creativo" },
              ].map((t) => (
                <button key={t.id} onClick={() => setData({ ...data, tone: t.id })}
                  className={`p-2.5 rounded-lg border text-xs font-medium transition-all ${data.tone === t.id ? "border-gray-900 bg-gray-50" : "border-gray-200"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Volumen diario</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "low", label: "Bajo", desc: "10/día" },
                { id: "medium", label: "Medio", desc: "25/día" },
                { id: "high", label: "Alto", desc: "50/día" },
              ].map((e) => (
                <button key={e.id} onClick={() => setData({ ...data, effort: e.id })}
                  className={`p-2.5 rounded-lg border text-center transition-all ${data.effort === e.id ? "border-gray-900 bg-gray-50" : "border-gray-200"}`}>
                  <p className="text-xs font-medium text-gray-900">{e.label}</p>
                  <p className="text-[10px] text-gray-500">{e.desc}</p>
                </button>
              ))}
            </div>
          </div>
          {generationError && <p role="alert" className="text-xs text-red-700">{generationError}</p>}
          <label className="flex items-center gap-2 text-xs text-gray-700">
            <input type="checkbox" checked={useAi360 && ai360Available}
              disabled={!ai360Available} onChange={e => setUseAi360(e.target.checked)} />
            Mejorar borradores con APIs360 local {ai360Available ? "(disponible)" : "(solo en PC conectado)"}
          </label>
          <p className="text-[11px] text-gray-500">Usa marcadores genéricos, sin contactos reales; nunca envía mensajes.</p>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setStep("product")} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600">Volver</button>
            <button onClick={generateCampaign} className="flex-1 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium">Generar campaña</button>
          </div>
        </div>
      )}

      {/* Step: Generating */}
      {step === "generating" && (
        <div className="flex flex-col items-center justify-center h-48 gap-4">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          <p className="text-sm text-gray-600">Generando estrategia y mensajes...</p>
        </div>
      )}

      {/* Step: Result */}
      {step === "result" && result && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{result.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{networkLabels[data.network]} · {result.steps.length} pasos · {result.settings.dailyLimit} acciones/día</p>
          </div>

          {/* Steps */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Secuencia</p>
            </div>
            <div className="divide-y divide-gray-100">
              {result.steps.map((s, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-medium text-gray-600 shrink-0">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{s.description}</p>
                    {s.delayHours > 0 && <p className="text-[11px] text-gray-400 mt-0.5">Esperar {s.delayHours}h</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Messages */}
          {ai360Notice && <p role="status" className="text-xs text-gray-600">{ai360Notice}</p>}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Mensajes generados</p>
            </div>
            <div className="divide-y divide-gray-100">
              {result.messages.map((msg, i) => (
                <div key={i} className="px-4 py-3">
                  <p className="text-[11px] font-medium text-gray-500 mb-1">{i === 0 ? "Primer contacto" : i === 1 ? "Follow-up" : "Propuesta"}</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          {result.tips.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-700 mb-2">Recomendaciones</p>
              <ul className="space-y-1">
                {result.tips.map((tip, i) => (
                  <li key={i} className="text-xs text-gray-600">· {tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <button onClick={saveCampaign} className="w-full py-3 rounded-lg bg-gray-900 text-white text-sm font-medium">Activar campaña</button>
            <button onClick={() => setStep("objective")} className="w-full py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600">Crear otra</button>
          </div>
        </div>
      )}
    </div>
  );
}
