import React, { useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Loader2,
  CalendarPlus,
  Clock,
  AlertCircle,
} from "lucide-react";
import type {
  AIToolType,
  GenerateRequest,
  GenerateResponse,
  Language,
  SocialPlatform,
  ToneOption,
} from "../types/index.ts";
import { getTranslation } from "../lib/i18n.ts";

interface AIToolWorkspaceProps {
  tool: AIToolType;
  lang: Language;
  liveAiConfigured: boolean;
  onSendToScheduler: (platform: SocialPlatform, content: string) => void;
  onAddToPlanner: (
    platform: SocialPlatform,
    title: string,
    notes: string
  ) => void;
}

export function AIToolWorkspace({
  tool,
  lang,
  liveAiConfigured,
  onSendToScheduler,
  onAddToPlanner,
}: AIToolWorkspaceProps) {
  const t = getTranslation(lang);

  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<ToneOption>("engaging");
  const [audience, setAudience] = useState("");
  const [extraOption, setExtraOption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const defaultExtraChoices: Record<AIToolType, string[]> = {
    facebook:
      lang === "ar"
        ? [
            "زيادة التفاعل والتعليقات",
            "زيارة الموقع الإلكتروني",
            "الترويج لعرض خاص",
          ]
        : ["Drive Comments", "Website Clicks", "Promote Special Offer"],
    instagram:
      lang === "ar"
        ? ["مزيج قصير وسردي", "سرد قصصي ملهم", "سؤال تفاعلي"]
        : ["Balanced Mix", "Storytelling", "Question Hook"],
    hashtags: ["15 Hashtags", "10 Focused", "20 Broad"],
    tiktok: ["15s", "30s", "60s"],
    youtube:
      lang === "ar"
        ? ["تسويق، محتوى، نمو", "شرح عملي، دليل 2026"]
        : ["tutorial, guide, 2026", "tips, strategy, workflow"],
  };

  const targetPlatform: SocialPlatform =
    tool === "hashtags" ? "instagram" : tool;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const payload: GenerateRequest = {
        tool,
        language: lang,
        topic: topic.trim(),
        tone,
        audience: audience.trim(),
        extraOption: extraOption.trim() || defaultExtraChoices[tool][0],
      };

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as GenerateResponse & { error?: string };

      if (!res.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : lang === "ar"
            ? "حدث خطأ أثناء توليد المحتوى. يرجى المحاولة مرة أخرى."
            : "Something went wrong while generating content. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      // Clipboard API unavailable in non-secure context
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
      {/* Left: Configuration Form */}
      <form
        onSubmit={handleGenerate}
        className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-5 sm:p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">
            {t.tools.topicLabel} *
          </label>
          <textarea
            rows={3}
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t.tools.topicPlaceholder}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              {t.tools.toneLabel}
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as ToneOption)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
            >
              {(Object.keys(t.tools.tones) as ToneOption[]).map((key) => (
                <option key={key} value={key}>
                  {t.tools.tones[key]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              {t.tools.extraLabel[tool]}
            </label>
            {tool === "youtube" ? (
              <input
                type="text"
                value={extraOption}
                onChange={(e) => setExtraOption(e.target.value)}
                placeholder={defaultExtraChoices.youtube[0]}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            ) : (
              <select
                value={extraOption || defaultExtraChoices[tool][0]}
                onChange={(e) => setExtraOption(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
              >
                {defaultExtraChoices[tool].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">
            {t.tools.audienceLabel}
          </label>
          <input
            type="text"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder={t.tools.audiencePlaceholder}
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              <span>{t.tools.generating}</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>{t.tools.generateBtn}</span>
            </>
          )}
        </button>

        <p className="border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-500">
          {liveAiConfigured ? t.tools.liveNotice : t.tools.sampleNotice}
        </p>
      </form>

      {/* Right: Results Workspace */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-7 sm:p-6 flex flex-col min-h-[420px]">
        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
            <p className="mt-3 text-sm font-medium text-slate-600">
              {t.tools.generating}
            </p>
          </div>
        ) : !result ? (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <div className="rounded-xl bg-blue-50 p-3.5 text-blue-600">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900">
              {t.tools.emptyStateTitle}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {t.tools.emptyStateDesc}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <span className="text-xs font-semibold text-blue-700">
                {result.mode === "live-ai"
                  ? t.header.liveBadge
                  : t.header.demoBadge}
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(result.rawText, "all")}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  {copiedKey === "all" ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span>
                    {copiedKey === "all" ? t.tools.copied : t.tools.copyAll}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onAddToPlanner(targetPlatform, topic, result.rawText)
                  }
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  <CalendarPlus className="h-3.5 w-3.5 shrink-0" />
                  <span>{t.tools.addToPlanner}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onSendToScheduler(targetPlatform, result.rawText)
                  }
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>{t.tools.sendToScheduler}</span>
                </button>
              </div>
            </div>

            {/* Generated Sections (clean vertical rhythm separated by hairline dividers) */}
            <div className="divide-y divide-slate-100">
              {result.sections.map((section, idx) => (
                <div key={idx} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="text-xs font-bold text-blue-700">
                      {section.label}
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleCopy(section.content, `sec-${idx}`)}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-blue-600 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-blue-600"
                    >
                      {copiedKey === `sec-${idx}` ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                          <span>{t.tools.copied}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 shrink-0" />
                          <span>{t.tools.copyBtn}</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-slate-800">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
