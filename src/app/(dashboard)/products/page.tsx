"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  type: "service" | "product" | "subscription";
  benefits: string[];
  deliveryTime: string;
  isActive: boolean;
}

const demoProducts: Product[] = [
  {
    id: "1", name: "Diseño Web Profesional", description: "Landing page o sitio web completo con diseño moderno y responsive",
    price: "497", currency: "€", type: "service", benefits: ["Diseño personalizado", "SEO básico incluido", "Responsive", "Entrega en 7 días"], deliveryTime: "7 días", isActive: true,
  },
  {
    id: "2", name: "Gestión de Redes Sociales", description: "Contenido, publicaciones y engagement para tus redes sociales",
    price: "299/mes", currency: "€", type: "subscription", benefits: ["20 posts/mes", "Stories diarias", "Engagement activo", "Reporte mensual"], deliveryTime: "Mensual", isActive: true,
  },
  {
    id: "3", name: "Consultoría de Marketing Digital", description: "Sesión 1:1 para definir tu estrategia digital",
    price: "150", currency: "€", type: "service", benefits: ["60 min de sesión", "Plan de acción", "Seguimiento email", "Grabación incluida"], deliveryTime: "Agendado", isActive: true,
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  function createProduct(formData: FormData) {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: formData.get("price") as string,
      currency: "€",
      type: formData.get("type") as Product["type"],
      benefits: (formData.get("benefits") as string).split("\n").filter(Boolean),
      deliveryTime: formData.get("deliveryTime") as string,
      isActive: true,
    };
    setProducts([newProduct, ...products]);
    setShowCreate(false);
  }

  function generateProposal(product: Product) {
    const proposal = `
━━━━━━━━━━━━━━━━━━━━━━
  📋 PROPUESTA
━━━━━━━━━━━━━━━━━━━━━━

🎯 ${product.name}
${product.description}

💰 Inversión: ${product.price}${product.currency}
⏱️ Entrega: ${product.deliveryTime}

✅ Lo que incluye:
${product.benefits.map((b) => `  • ${b}`).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━
¿Te interesa? Responde a este mensaje
y empezamos hoy mismo. 🚀
━━━━━━━━━━━━━━━━━━━━━━`;

    navigator.clipboard.writeText(proposal);
    alert("¡Propuesta copiada al portapapeles! Pégala en cualquier chat.");
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Productos & Servicios</h1>
          <p className="text-xs text-gray-500 mt-0.5">Tu catálogo para vender en cualquier red</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>+ Nuevo</Button>
      </div>

      {/* Product cards */}
      <div className="space-y-3">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => setSelectedProduct(product)}
            className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-gray-900">{product.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{product.description}</p>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="text-lg font-bold text-blue-600">{product.price}{product.currency}</p>
                <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded-full text-gray-600 capitalize">{product.type}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-3">
              {product.benefits.slice(0, 3).map((b, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 bg-green-50 text-green-700 rounded-full">✓ {b}</span>
              ))}
              {product.benefits.length > 3 && (
                <span className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full">+{product.benefits.length - 3} más</span>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={(e) => { e.stopPropagation(); generateProposal(product); }}
                className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-medium active:scale-95"
              >
                📋 Copiar Propuesta
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); }}
                className="flex-1 py-2 bg-purple-50 text-purple-700 rounded-xl text-xs font-medium active:scale-95"
              >
                ✨ Generar con IA
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Tip card */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-5 text-white">
        <h3 className="font-bold mb-1">💡 Tip: Vende sin fricción</h3>
        <p className="text-xs opacity-90">
          Cuando la IA genera un mensaje de propuesta, incluye automáticamente tu producto con precio y beneficios.
          El prospecto puede decidir en el momento sin necesidad de una llamada previa.
        </p>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl md:rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Nuevo Producto/Servicio</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createProduct(new FormData(e.currentTarget)); }} className="space-y-3">
              <input name="name" required placeholder="Nombre del producto/servicio" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" />
              <textarea name="description" required placeholder="Descripción breve" rows={2} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input name="price" required placeholder="Precio (ej: 497)" className="px-4 py-3 border border-gray-200 rounded-xl text-sm" />
                <select name="type" className="px-4 py-3 border border-gray-200 rounded-xl text-sm">
                  <option value="service">Servicio</option>
                  <option value="product">Producto</option>
                  <option value="subscription">Suscripción</option>
                </select>
              </div>
              <textarea name="benefits" required placeholder="Beneficios (uno por línea)&#10;Ej: Entrega en 7 días&#10;Soporte 24/7" rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" />
              <input name="deliveryTime" placeholder="Tiempo de entrega (ej: 7 días)" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" />
              <Button type="submit" className="w-full py-3">Crear Producto</Button>
            </form>
          </div>
        </div>
      )}

      {/* Product detail modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl md:rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{selectedProduct.name}</h2>
              <button onClick={() => setSelectedProduct(null)} className="text-gray-400 text-2xl">×</button>
            </div>
            <p className="text-sm text-gray-600 mb-3">{selectedProduct.description}</p>
            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Precio</span>
                <span className="text-2xl font-bold text-blue-600">{selectedProduct.price}{selectedProduct.currency}</span>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <p className="text-sm font-medium text-gray-700">Incluye:</p>
              {selectedProduct.benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-sm text-gray-600">{b}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <button onClick={() => generateProposal(selectedProduct)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium active:scale-95">
                📋 Copiar Propuesta para enviar
              </button>
              <button onClick={() => setSelectedProduct(null)} className="w-full py-3 border border-gray-200 rounded-xl text-sm text-gray-600">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
