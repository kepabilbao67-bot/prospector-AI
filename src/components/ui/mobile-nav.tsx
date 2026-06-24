"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Inicio", href: "/" },
  { name: "Contactos", href: "/contacts" },
  { name: "Campaña", href: "/wizard" },
  { name: "Inbox", href: "/inbox" },
  { name: "Más", href: "/menu" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe md:hidden">
      <div className="grid grid-cols-5 h-14">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && item.href !== "/menu" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 transition-colors",
                isActive ? "text-gray-900" : "text-gray-400"
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
