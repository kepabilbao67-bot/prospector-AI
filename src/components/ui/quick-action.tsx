"use client";

import { useState } from "react";
import Link from "next/link";

const quickActions = [
  { label: "Nueva campaña", href: "/wizard" },
  { label: "Añadir contacto", href: "/contacts" },
  { label: "Generar propuesta", href: "/products" },
  { label: "Importar CSV", href: "/import" },
  { label: "Ver pipeline", href: "/pipeline" },
];

export function QuickActionButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 z-40 md:bottom-6 md:right-6">
      {open && (
        <div className="absolute bottom-14 right-0 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden w-48 animate-in">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href} onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
              {action.label}
            </Link>
          ))}
        </div>
      )}

      <button onClick={() => setOpen(!open)}
        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ${
          open ? "bg-gray-600 rotate-45" : "bg-gray-900 hover:bg-gray-800"
        }`}>
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
