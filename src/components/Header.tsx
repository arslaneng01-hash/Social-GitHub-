import React from "react";
import { Globe, Menu } from "lucide-react";
import type { Language } from "../types/index.ts";
import { getTranslation } from "../lib/i18n.ts";

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  onOpenMobileMenu: () => void;
  pageTitle: string;
}

export function Header({
  lang,
  onToggleLang,
  onOpenMobileMenu,
  pageTitle,
}: HeaderProps) {
  const t = getTranslation(lang);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-8 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="text-base font-semibold text-slate-900 sm:text-lg truncate">
          {pageTitle}
        </h2>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onToggleLang}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          <Globe className="h-4 w-4 text-blue-600 shrink-0" />
          <span>{t.header.switchLang}</span>
        </button>
      </div>
    </header>
  );
}
