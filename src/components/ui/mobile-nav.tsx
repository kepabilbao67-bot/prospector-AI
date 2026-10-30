"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { House, Users, Sparkles, Inbox, Menu } from "lucide-react";

const navigation = [
  { name: "Inicio", href: "/", icon: House },
  { name: "Contactos", href: "/contacts", icon: Users },
  { name: "Campaña", href: "/wizard", icon: Sparkles },
  { name: "Inbox", href: "/inbox", icon: Inbox },
  { name: "Más", href: "/menu", icon: Menu },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación móvil" className="fixed bottom-0 left-0 right-0 z-50 border-t border-violet-100 bg-white/95 backdrop-blur pb-safe md:hidden">
      <div className="grid h-16 grid-cols-5">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && item.href !== "/menu" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-indigo-600",
                isActive ? "text-indigo-700 bg-indigo-50" : "text-slate-500 hover:text-indigo-700"
              )}
            >
              <div className={cn(
                "w-1 h-1 rounded-full mb-0.5 transition-all",
                isActive ? "bg-gray-900" : "bg-transparent"
              )} />
              <span className="text-[11px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
