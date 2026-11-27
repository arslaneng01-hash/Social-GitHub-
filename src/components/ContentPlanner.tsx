import React, { useState } from "react";
import {
  Plus,
  ArrowRight,
  Trash2,
  Clock,
  CalendarRange,
  Search,
} from "lucide-react";
import type {
  Language,
  PlannerItem,
  PlannerStatus,
  SocialPlatform,
} from "../types/index.ts";
import { getTranslation } from "../lib/i18n.ts";

interface ContentPlannerProps {
  lang: Language;
  items: PlannerItem[];
  onAddItem: (item: Omit<PlannerItem, "id">) => void;
  onUpdateStatus: (id: string, status: PlannerStatus) => void;
  onDeleteItem: (id: string) => void;
  onPushToScheduler: (platform: SocialPlatform, content: string) => void;
}

const STATUS_ORDER: PlannerStatus[] = ["idea", "draft", "ready", "scheduled"];

export function ContentPlanner({
  lang,
  items,
  onAddItem,
  onUpdateStatus,
  onDeleteItem,
  onPushToScheduler,
}: ContentPlannerProps) {
  const t = getTranslation(lang);

  const [filterPlatform, setFilterPlatform] = useState<SocialPlatform | "all">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState<SocialPlatform>("instagram");
  const [pillar, setPillar] = useState(
    lang === "ar" ? "تعليمي" : "Educational"
  );
  const [targetDate, setTargetDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddItem({
      title: title.trim(),
      platform,
      pillar: pillar.trim() || (lang === "ar" ? "عام" : "General"),
      targetDate,
      status: "idea",
      notes: notes.trim(),
    });
    setTitle("");
    setNotes("");
  };

  const filtered = items.filter((item) => {
    const matchesPlatform =
      filterPlatform === "all" || item.platform === filterPlatform;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.pillar.toLowerCase().includes(q) ||
      item.notes.toLowerCase().includes(q);
    return matchesPlatform && matchesSearch;
  });

  const statusTextColor = (status: PlannerStatus) => {
    const map: Record<PlannerStatus, string> = {
      idea: "text-slate-600",
      draft: "text-amber-700",
      ready: "text-blue-700",
      scheduled: "text-emerald-700",
    };
    return map[status];
  };

  return (
    <div className="space-y-6">
      {/* Header + Filter Controls */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600 shrink-0">
            <CalendarRange className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {t.planner.title}
            </h3>
            <p className="text-xs text-slate-500">{t.planner.subtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.planner.searchPlaceholder}
              className="h-10 w-48 rounded-lg border border-slate-200 bg-slate-50/70 ps-9 pe-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none sm:w-56"
            />
          </div>

          <select
            value={filterPlatform}
            onChange={(e) =>
              setFilterPlatform(e.target.value as SocialPlatform | "all")
            }
            className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">{t.planner.filterAll}</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
          </select>
        </div>
      </div>

      {/* Add Content Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-5 space-y-4"
      >
        <h4 className="text-sm font-semibold text-slate-800">
          {t.planner.addIdea}
        </h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.planner.ideaTitle}
            className="h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
          />
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as SocialPlatform)}
            className="h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
          >
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
          </select>
          <input
            type="text"
            value={pillar}
            onChange={(e) => setPillar(e.target.value)}
            placeholder={t.planner.pillar}
            className="h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
          />
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 font-mono text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.planner.notes}
            className="h-10 flex-1 rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>{t.planner.save}</span>
          </button>
        </div>
      </form>

      {/* Content Cards or Empty State */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm font-semibold text-slate-900">
            {t.planner.emptyTitle}
          </p>
          <p className="mt-1 text-sm text-slate-500">{t.planner.emptyDesc}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((item) => {
            const nextIdx =
              (STATUS_ORDER.indexOf(item.status) + 1) % STATUS_ORDER.length;
            const nextStatus = STATUS_ORDER[nextIdx];

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-bold uppercase text-blue-600">
                      {item.platform}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{item.pillar}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {item.targetDate}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className={`font-semibold ${statusTextColor(item.status)}`}>
                      {t.planner.statuses[item.status]}
                    </span>
                  </div>

                  <h4 className="mt-2.5 text-base font-semibold text-slate-900">
                    {item.title}
                  </h4>
                  {item.notes && (
                    <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-slate-600">
                      {item.notes}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(item.id, nextStatus)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-blue-600"
                  >
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    <span>{t.planner.moveNext}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onPushToScheduler(
                          item.platform,
                          item.notes
                            ? `${item.title}\n\n${item.notes}`
                            : item.title
                        )
                      }
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-blue-600"
                    >
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>{t.planner.pushSchedule}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteItem(item.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-red-600"
                      aria-label={t.planner.delete}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
