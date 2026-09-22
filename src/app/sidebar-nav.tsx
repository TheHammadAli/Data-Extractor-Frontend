"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/agent", label: "Agent", icon: AgentIcon },
  { href: "/results", label: "Results", icon: ResultsIcon },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="flex shrink-0 flex-col gap-6 border-b border-zinc-200 bg-white px-4 py-5 md:h-screen md:w-60 md:border-b-0 md:border-r md:sticky md:top-0 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2.5 px-1">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900">
          <LogoIcon />
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold leading-tight tracking-tight">Data Extractor</p>
          <p className="truncate text-xs text-zinc-500">AI Browser Agent</p>
        </div>
      </div>

      <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

      <nav className="flex flex-col gap-1 text-sm font-medium">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 transition-colors ${
                active
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              <Icon />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function LogoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
      <path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
    </svg>
  );
}

function AgentIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <rect x="4" y="8" width="16" height="11" rx="2" />
      <path d="M12 8V4" />
      <circle cx="12" cy="3" r="1" />
      <circle cx="9" cy="13.5" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="15" cy="13.5" r="1.25" fill="currentColor" stroke="none" />
      <path d="M8 19v1M16 19v1" />
    </svg>
  );
}

function ResultsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <rect x="3.5" y="4" width="17" height="16" rx="2" />
      <path d="M3.5 9.5h17" />
      <path d="M9 9.5V20" />
    </svg>
  );
}
