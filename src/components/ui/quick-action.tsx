"use client";

import { useState } from "react";
import Link from "next/link";

const quickActions = [
  { icon: "✨", label: "Campaña IA", href: "/wizard", color: "bg-purple-500" },
  { icon: "👤", label: "Añadir Lead", href: "/contacts", color: "bg-blue-500" },
  { icon: "📋", label: "Propuesta", href: "/products", color: "bg-green-500" },
  { icon: "📥", label: "Importar", href: "/import", color: "bg-orange-500" },
  { icon: "💰", label: "Venta", href: "/revenue", color: "bg-emerald-500" },
];

export function QuickActionButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 z-40 md:bottom-6 md:right-6">
      {/* Action menu */}
      {open && (
        <div className="absolute bottom-16 right-0 space-y-2 animate-in">
          {quickActions.map((action, i) => (
            <Link
              key={action.label}
              href={action.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-full shadow-lg border border-gray-100 hover:shadow-xl transition-all active:scale-95"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className={`w-8 h-8 ${action.color} rounded-full flex items-center justify-center text-white text-sm`}>
                {action.icon}
              </span>
              <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{action.label}</span>
            </Link>
          ))}
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white text-2xl transition-all active:scale-90 ${
          open
            ? "bg-gray-800 rotate-45"
            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-2xl hover:scale-105"
        }`}
      >
        {open ? "+" : "⚡"}
      </button>
    </div>
  );
}
