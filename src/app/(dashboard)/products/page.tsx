"use client";

import { useState } from "react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  type: "service" | "product" | "subscription";
  benefits: string[];
  deliveryTime: string;
}

const demoProducts: Product[] = [
  { id: "1", name: "Diseño Web Profesional", description: "Landing page o sitio web completo con diseño moderno y responsive", price: "497€", type: "service", benefits: ["Diseño personalizado", "SEO básico incluido", "Responsive", "Entrega en 7 días"], deliveryTime: "7 días" },
  { id: "2", name: "Gestión de Redes Sociales", description: "Contenido, publicaciones y engagement para tus redes sociales", price: "299€/mes", type: "subscription", benefits: ["20 posts/mes", "Stories diarias", "Engagement activo", "Reporte mensual"], deliveryTime: "Mensual" },
  { id: "3", name: "Consultoría de Marketing", description: "Sesión 1:1 para definir tu estrategia digital", price: "150€", type: "service", benefits: ["60 min de sesión", "Plan de acción", "Seguimiento email", "Grabación incluida"], deliveryTime: "Agendado" },
];

export default function ProductsPage() {
  const [products] = useState(demoProducts);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);

  function copyProposal(product: Product) {
    const proposal = `${product.name}\n${product.description}\n\nPrecio: ${product.price}\nEntrega: ${product.deliveryTime}\n\nIncluye:\n${product.benefits.map(b => `- ${b}`).join("\n")}\n\n¿Te interesa? Responde a este mensaje y empezamos.`;
    navigator.clipboard.writeText(proposal);
    alert("Propuesta copiada al portapapeles");
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Productos y Servicios</h1>
          <p className="text-xs text-gray-500">Catálogo para generar propuestas rápidas</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">Nuevo</button>
      </div>

      <div className="space-y-3">
        {products.map((product) => (
          <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{product.description}</p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-sm font-semibold text-gray-900">{product.price}</p>
                <p className="text-[10px] text-gray-400 capitalize">{product.type === "subscription" ? "Recurrente" : "Pago único"}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {product.benefits.map((b, i) => (
                <span key={i} className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded text-[10px] text-gray-600">{b}</span>
              ))}
            </div>
            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
              <button onClick={() => copyProposal(product)} className="flex-1 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50">
                Copiar propuesta
              </button>
              <button onClick={() => setSelected(product)} className="flex-1 py-2 bg-gray-900 text-white rounded-lg text-xs font-medium">
                Ver detalle
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-xl p-5 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 text-xl">×</button>
            </div>
            <p className="text-sm text-gray-600 mb-3">{selected.description}</p>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-3">
              <span className="text-xs text-gray-500">Precio</span>
              <span className="text-lg font-semibold text-gray-900">{selected.price}</span>
            </div>
            <div className="space-y-1.5 mb-4">
              {selected.benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1 h-1 bg-gray-400 rounded-full" />
                  {b}
                </div>
              ))}
            </div>
            <button onClick={() => { copyProposal(selected); setSelected(null); }}
              className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium">
              Copiar propuesta
            </button>
          </div>
        </div>
      )}

      {/* Create */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-xl p-5 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Nuevo producto</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 text-xl">×</button>
            </div>
            <form className="space-y-3">
              <input placeholder="Nombre" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-900" />
              <textarea placeholder="Descripción" rows={2} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-900" />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Precio" className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-900" />
                <select className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-900">
                  <option value="service">Servicio</option>
                  <option value="subscription">Suscripción</option>
                </select>
              </div>
              <textarea placeholder="Beneficios (uno por línea)" rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-900" />
              <button type="button" onClick={() => setShowCreate(false)} className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium">Crear</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
