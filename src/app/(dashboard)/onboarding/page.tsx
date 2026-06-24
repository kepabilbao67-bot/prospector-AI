"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getNetworkIcon } from "@/lib/utils";

type OnboardingStep = "welcome" | "networks" | "goal" | "product" | "ready";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);
  const [goal, setGoal] = useState("");
  const [productName, setProductName] = useState("");

  function toggleNetwork(id: string) {
    setSelectedNetworks((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]
    );
  }

  async function finishOnboarding() {
    await fetch("/api/seed", { method: "POST" });
    router.push("/wizard");
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full px-4">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {["welcome","networks","goal","product","ready"].map((s, i) => (
            <div key={s} className={`w-2.5 h-2.5 rounded-full transition-all ${
              ["welcome","networks","goal","product","ready"].indexOf(step) >= i
                ? "bg-blue-600 scale-110" : "bg-gray-200"
            }`} />
          ))}
        </div>

        {/* Welcome */}
        {step === "welcome" && (
          <div className="text-center animate-in space-y-6">
            <div className="text-6xl animate-bounce">🔥</div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bienvenido a ProspectorAI
            </h1>
            <p className="text-gray-500">
              Tu asistente de captación de clientes con IA.
              En 2 minutos tendrás tu primera campaña activa.
            </p>
            <button
              onClick={() => setStep("networks")}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg active:scale-95 transition-all shadow-lg shadow-blue-200"
            >
              Empezar →
            </button>
          </div>
        )}

        {/* Networks */}
        {step === "networks" && (
          <div className="animate-in space-y-5">
            <div className="text-center">
              <p className="text-3xl mb-2">🌐</p>
              <h2 className="text-xl font-bold text-gray-900">
                ¿Dónde están tus clientes?
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Selecciona las redes donde quieres prospectar
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "linkedin", name: "LinkedIn" },
                { id: "fiverr", name: "Fiverr" },
                { id: "instagram", name: "Instagram" },
                { id: "twitter", name: "Twitter/X" },
                { id: "email", name: "Email" },
                { id: "whatsapp", name: "WhatsApp" },
                { id: "tiktok", name: "TikTok" },
                { id: "facebook", name: "Facebook" },
              ].map((net) => (
                <button
                  key={net.id}
                  onClick={() => toggleNetwork(net.id)}
                  className={`p-4 rounded-2xl border-2 text-center active:scale-95 transition-all ${
                    selectedNetworks.includes(net.id)
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-100 bg-white"
                  }`}
                >
                  <span className="text-2xl block mb-1">
                    {getNetworkIcon(net.id)}
                  </span>
                  <p className="text-sm font-medium">{net.name}</p>
                  {selectedNetworks.includes(net.id) && (
                    <span className="text-[10px] text-blue-600">✓ Seleccionado</span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep("goal")}
              disabled={selectedNetworks.length === 0}
              className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-medium active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente →
            </button>
          </div>
        )}

        {/* Goal */}
        {step === "goal" && (
          <div className="animate-in space-y-5">
            <div className="text-center">
              <p className="text-3xl mb-2">🎯</p>
              <h2 className="text-xl font-bold text-gray-900">
                ¿Cuál es tu objetivo principal?
              </h2>
            </div>
            <div className="space-y-3">
              {[
                { id: "get_clients", icon: "🤝", title: "Conseguir clientes nuevos" },
                { id: "sell_product", icon: "🛍️", title: "Vender un servicio/producto" },
                { id: "grow_network", icon: "📈", title: "Crecer mi audiencia" },
                { id: "freelance", icon: "💻", title: "Conseguir proyectos freelance" },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => { setGoal(g.id); setStep("product"); }}
                  className={`w-full p-4 rounded-2xl border-2 text-left flex items-center gap-4 active:scale-[0.98] transition-all ${
                    goal === g.id ? "border-blue-500 bg-blue-50" : "border-gray-100 bg-white"
                  }`}
                >
                  <span className="text-2xl">{g.icon}</span>
                  <span className="font-medium text-gray-900">{g.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Product */}
        {step === "product" && (
          <div className="animate-in space-y-5">
            <div className="text-center">
              <p className="text-3xl mb-2">🛍️</p>
              <h2 className="text-xl font-bold text-gray-900">
                ¿Qué ofreces?
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Cuéntanos brevemente para personalizar tus mensajes
              </p>
            </div>
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ej: Diseño web, Consultoría, Marketing digital..."
              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setStep("ready")}
                className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl font-medium active:scale-95"
              >
                {productName ? "Siguiente →" : "Omitir →"}
              </button>
            </div>
          </div>
        )}

        {/* Ready */}
        {step === "ready" && (
          <div className="animate-in space-y-6 text-center">
            <div className="text-6xl">🚀</div>
            <h2 className="text-2xl font-bold text-gray-900">¡Todo listo!</h2>
            <p className="text-gray-500">
              ProspectorAI va a crear tu primera campaña con IA
              adaptada a tus redes y objetivos.
            </p>
            <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2">
              <p className="text-sm">
                <strong>Redes:</strong> {selectedNetworks.map(n => getNetworkIcon(n)).join(" ")}
              </p>
              <p className="text-sm">
                <strong>Objetivo:</strong> {goal || "Conseguir clientes"}
              </p>
              {productName && (
                <p className="text-sm">
                  <strong>Servicio:</strong> {productName}
                </p>
              )}
            </div>
            <button
              onClick={finishOnboarding}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg active:scale-95 shadow-lg shadow-blue-200 transition-all"
            >
              ✨ Crear mi primera campaña con IA
            </button>
            <button
              onClick={() => { finishOnboarding(); router.push("/"); }}
              className="text-sm text-gray-400"
            >
              Ir al dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
