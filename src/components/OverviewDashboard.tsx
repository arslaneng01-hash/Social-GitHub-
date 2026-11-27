import React from "react";
import {
  Facebook,
  Instagram,
  Hash,
  Video,
  Youtube,
  CalendarRange,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type {
  Language,
  NavSection,
  PlannerItem,
  ScheduledPost,
} from "../types/index.ts";
import { getTranslation } from "../lib/i18n.ts";

interface OverviewDashboardProps {
  lang: Language;
  plannerItems: PlannerItem[];
  scheduledPosts: ScheduledPost[];
  onNavigate: (section: NavSection) => void;
}

export function OverviewDashboard({
  lang,
  plannerItems,
  scheduledPosts,
  onNavigate,
}: OverviewDashboardProps) {
  const t = getTranslation(lang);

  const scheduledCount = scheduledPosts.filter(
    (p) => p.status === "scheduled"
  ).length;
  const publishedCount = scheduledPosts.filter(
    (p) => p.status === "published"
  ).length;

  const stats = [
    {
      label: t.overview.kpiScheduled,
      value: scheduledCount,
      icon: <Clock className="h-5 w-5 text-blue-600" />,
      bg: "bg-blue-50",
    },
    {
      label: t.overview.kpiPlanned,
      value: plannerItems.length,
      icon: <CalendarRange className="h-5 w-5 text-sky-600" />,
      bg: "bg-sky-50",
    },
    {
      label: t.overview.kpiPublished,
      value: publishedCount,
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
      bg: "bg-emerald-50",
    },
    {
      label: t.overview.kpiChannels,
      value: 4,
      icon: <ShieldCheck className="h-5 w-5 text-blue-700" />,
      bg: "bg-blue-50",
    },
  ];

  const quickTools: {
    id: NavSection;
    title: string;
    icon: React.ReactNode;
    accent: string;
  }[] = [
    {
      id: "facebook",
      title: t.nav.facebook,
      icon: <Facebook className="h-5 w-5" />,
      accent: "text-blue-600 bg-blue-50",
    },
    {
      id: "instagram",
      title: t.nav.instagram,
      icon: <Instagram className="h-5 w-5" />,
      accent: "text-pink-600 bg-pink-50",
    },
    {
      id: "hashtags",
      title: t.nav.hashtags,
      icon: <Hash className="h-5 w-5" />,
      accent: "text-sky-600 bg-sky-50",
    },
    {
      id: "tiktok",
      title: t.nav.tiktok,
      icon: <Video className="h-5 w-5" />,
      accent: "text-slate-800 bg-slate-100",
    },
    {
      id: "youtube",
      title: t.nav.youtube,
      icon: <Youtube className="h-5 w-5" />,
      accent: "text-red-600 bg-red-50",
    },
  ];

  const upcoming = scheduledPosts
    .filter((p) => p.status === "scheduled")
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <section className="rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-sky-700 p-6 text-white sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold tracking-tight text-balance sm:text-2xl">
              {t.overview.welcomeTitle}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-blue-100 sm:text-base">
              {t.overview.welcomeSub}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("facebook")}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-white"
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>{t.overview.primaryCta}</span>
          </button>
        </div>
      </section>

      {/* KPI Strip */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-lg p-2.5 ${stat.bg}`}>{stat.icon}</div>
              <span className="font-mono text-2xl font-bold tabular-nums text-slate-900">
                {stat.value}
              </span>
            </div>
            <p className="mt-3 text-xs font-medium text-slate-500 sm:text-sm">
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      {/* Quick Launch AI Tools */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <h3 className="text-base font-semibold text-slate-900">
          {t.overview.quickLaunch}
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {quickTools.map((tool) => (
            <button
              type="button"
              key={tool.id}
              onClick={() => onNavigate(tool.id)}
              className="group flex min-h-[56px] items-center justify-between rounded-lg border border-slate-200 bg-white p-3.5 text-start transition-colors hover:border-blue-300 hover:bg-blue-50/50 focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`rounded-lg p-2 shrink-0 ${tool.accent}`}>
                  {tool.icon}
                </div>
                <span className="text-sm font-semibold text-slate-800 truncate">
                  {tool.title}
                </span>
              </div>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-blue-600" />
            </button>
          ))}
        </div>
      </section>

      {/* Bottom Split */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch">
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2 sm:p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-semibold text-slate-900">
              {t.overview.upcomingQueue}
            </h3>
            <button
              type="button"
              onClick={() => onNavigate("scheduler")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              {t.nav.scheduler}
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {upcoming.length === 0 ? (
              <p className="py-6 text-sm text-slate-500">
                {t.overview.noUpcoming}
              </p>
            ) : (
              upcoming.map((post) => (
                <div key={post.id} className="py-4 first:pt-4 last:pb-0">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold uppercase text-blue-700">
                      {post.platform}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {new Date(post.scheduledAt).toLocaleString(
                        lang === "ar" ? "ar-SA" : "en-US",
                        { dateStyle: "medium", timeStyle: "short" }
                      )}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{post.accountName}</span>
                  </div>
                  <p className="mt-1.5 truncate text-sm text-slate-800">
                    {post.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Meta API Architecture Card */}
        <div className="flex flex-col justify-between rounded-xl border border-blue-200 bg-blue-50/50 p-5 sm:p-6">
          <div>
            <div className="inline-flex rounded-lg bg-blue-600 p-2.5 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900">
              {t.overview.metaCardTitle}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {t.overview.metaCardDesc}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("scheduler")}
            className="mt-5 h-11 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            {t.overview.openScheduler}
          </button>
        </div>
      </section>
    </div>
  );
}
