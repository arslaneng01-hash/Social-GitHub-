import React from "react";
import {
  LayoutDashboard,
  Facebook,
  Instagram,
  Hash,
  Video,
  Youtube,
  CalendarRange,
  Clock,
  Sparkles,
  X,
  Download,
  Loader2,
} from "lucide-react";
import type { Language, NavSection } from "../types/index.ts";
import { getTranslation } from "../lib/i18n.ts";

interface SidebarProps {
  lang: Language;
  activeSection: NavSection;
  onSelect: (section: NavSection) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  lang,
  activeSection,
  onSelect,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const t = getTranslation(lang);
  const [downloadingZip, setDownloadingZip] = React.useState(false);

  const handleDownloadZip = async () => {
    if (downloadingZip) return;
    setDownloadingZip(true);
    try {
      const res = await fetch("/api/export-zip");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "socialtools-hub.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Keep UI resilient without blocking dialogs
    } finally {
      setDownloadingZip(false);
    }
  };

  const aiItems: { id: NavSection; label: string; icon: React.ReactNode }[] = [
    {
      id: "facebook",
      label: t.nav.facebook,
      icon: <Facebook className="h-4 w-4 shrink-0" />,
    },
    {
      id: "instagram",
      label: t.nav.instagram,
      icon: <Instagram className="h-4 w-4 shrink-0" />,
    },
    {
      id: "hashtags",
      label: t.nav.hashtags,
      icon: <Hash className="h-4 w-4 shrink-0" />,
    },
    {
      id: "tiktok",
      label: t.nav.tiktok,
      icon: <Video className="h-4 w-4 shrink-0" />,
    },
    {
      id: "youtube",
      label: t.nav.youtube,
      icon: <Youtube className="h-4 w-4 shrink-0" />,
    },
  ];

  const managementItems: {
    id: NavSection;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "planner",
      label: t.nav.planner,
      icon: <CalendarRange className="h-4 w-4 shrink-0" />,
    },
    {
      id: "scheduler",
      label: t.nav.scheduler,
      icon: <Clock className="h-4 w-4 shrink-0" />,
    },
  ];

  const handleNav = (id: NavSection) => {
    onSelect(id);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex h-full flex-col bg-white border-e border-slate-200">
      {/* Brand */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold tracking-tight text-slate-900 truncate">
              {t.appName}
            </h1>
            <p className="text-[11px] font-medium text-slate-500 truncate">
              {t.tagline}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-blue-600 lg:hidden"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <button
            type="button"
            onClick={() => handleNav("overview")}
            className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-blue-600 ${
              activeSection === "overview"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            <span className="truncate">{t.nav.overview}</span>
          </button>
        </div>

        <div>
          <p className="px-3.5 mb-2 text-xs font-semibold text-slate-400">
            {t.nav.aiTools}
          </p>
          <div className="space-y-1">
            {aiItems.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-blue-600 ${
                  activeSection === item.id
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span
                  className={
                    activeSection === item.id
                      ? "text-blue-600"
                      : "text-slate-400"
                  }
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="px-3.5 mb-2 text-xs font-semibold text-slate-400">
            {t.nav.management}
          </p>
          <div className="space-y-1">
            {managementItems.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-blue-600 ${
                  activeSection === item.id
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span
                  className={
                    activeSection === item.id
                      ? "text-blue-600"
                      : "text-slate-400"
                  }
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Project Download Action */}
      <div className="border-t border-slate-200 p-3">
        <button
          type="button"
          onClick={handleDownloadZip}
          disabled={downloadingZip}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-60 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          {downloadingZip ? (
            <Loader2 className="h-4 w-4 animate-spin shrink-0 text-blue-600" />
          ) : (
            <Download className="h-4 w-4 shrink-0 text-blue-600" />
          )}
          <span className="truncate">
            {downloadingZip ? t.nav.downloadingZip : t.nav.downloadZip}
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block lg:w-64 lg:shrink-0">
        <div className="sticky top-0 h-screen">{navContent}</div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full shadow-xl">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
