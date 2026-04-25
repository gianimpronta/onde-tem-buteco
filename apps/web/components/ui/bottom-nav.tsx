"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Início", icon: "home", href: "/", disabled: false },
  { label: "Mapa", icon: "map", href: "/", disabled: false },
  { label: "Rotas", icon: "rota", href: "/rotas", disabled: true },
  { label: "Carimbos", icon: "carimbo", href: "/minha-conta", disabled: false },
  { label: "Perfil", icon: "user", href: "/minha-conta", disabled: false },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-line-soft bg-white md:hidden"
      aria-label="Navegação principal"
    >
      {tabs.map(({ label, icon, href, disabled }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={label}
            href={disabled ? "#" : href}
            aria-disabled={disabled}
            aria-current={isActive ? "page" : undefined}
            className={[
              "flex flex-1 flex-col items-center gap-1 py-3 transition",
              isActive ? "bg-mostarda-100 text-tinto-700" : "text-ink-muted",
              disabled ? "pointer-events-none opacity-40" : "hover:text-tinto-700",
            ].join(" ")}
          >
            <svg className="h-5 w-5" aria-hidden>
              <use href={`/icons.svg#${icon}`} />
            </svg>
            <span className="font-mono text-[9px] uppercase tracking-wider">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
