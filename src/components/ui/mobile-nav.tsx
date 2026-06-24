"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Inicio", href: "/", icon: "📊", activeIcon: "📊" },
  { name: "Contactos", href: "/contacts", icon: "👥", activeIcon: "👥" },
  { name: "Wizard", href: "/wizard", icon: "✨", activeIcon: "✨" },
  { name: "Inbox", href: "/inbox", icon: "💬", activeIcon: "💬" },
  { name: "Más", href: "/menu", icon: "☰", activeIcon: "☰" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe md:hidden">
      <div className="grid grid-cols-5 h-16">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95",
                isActive ? "text-blue-600" : "text-gray-400"
              )}
            >
              <span className={cn("text-xl", item.href === "/wizard" && "text-2xl")}>
                {isActive ? item.activeIcon : item.icon}
              </span>
              <span className="text-[10px] font-medium">{item.name}</span>
              {isActive && (
                <div className="absolute top-0 w-8 h-0.5 bg-blue-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
