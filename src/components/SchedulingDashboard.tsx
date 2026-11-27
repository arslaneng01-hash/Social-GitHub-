import React, { useEffect, useState } from "react";
import {
  Clock,
  Send,
  Trash2,
  CheckCircle2,
  Link2,
  Plus,
  Loader2,
  AlertCircle,
  Paperclip,
} from "lucide-react";
import type {
  Language,
  ScheduledPost,
  ScheduledStatus,
  SocialAccountConnection,
  SocialPlatform,
} from "../types/index.ts";
import { getTranslation } from "../lib/i18n.ts";

interface SchedulingDashboardProps {
  lang: Language;
  posts: ScheduledPost[];
  prefill?: { platform: SocialPlatform; content: string } | null;
  onClearPrefill: () => void;
  onAddPost: (post: Omit<ScheduledPost, "id">) => void;
  onMarkPublished: (id: string) => void;
  onDeletePost: (id: string) => void;
}

export function SchedulingDashboard({
  lang,
  posts,
  prefill,
  onClearPrefill,
  onAddPost,
  onMarkPublished,
  onDeletePost,
}: SchedulingDashboardProps) {
  const t = getTranslation(lang);

  const [platform, setPlatform] = useState<SocialPlatform>("facebook");
  const [content, setContent] = useState("");
  const [scheduledAt, setScheduledAt] = useState(() => {
    const d = new Date(Date.now() + 3600 * 1000 * 4);
    return d.toISOString().slice(0, 16);
  });
  const [mediaNote, setMediaNote] = useState("");
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | ScheduledStatus>(
    "all"
  );
  const [toast, setToast] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  const [accounts, setAccounts] = useState<SocialAccountConnection[]>([
    {
      id: "fb-1",
      provider: "facebook",
      accountName: "SocialTools Official Page",
      handle: "@socialtoolshub",
      connected: true,
      followersCount: "12.4K",
    },
    {
      id: "ig-1",
      provider: "instagram",
      accountName: "Instagram Business",
      handle: "@socialtools.hub",
      connected: false,
    },
  ]);

  useEffect(() => {
    if (prefill) {
      setPlatform(prefill.platform);
      setContent(prefill.content);
      onClearPrefill();
    }
  }, [prefill, onClearPrefill]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onAddPost({
      platform,
      accountName:
        platform === "facebook"
          ? "SocialTools Official Page"
          : `${platform.toUpperCase()} Channel`,
      content: content.trim(),
      scheduledAt,
      status: "scheduled",
      mediaNote: mediaNote.trim() || undefined,
    });

    setContent("");
    setMediaNote("");
    showToast(t.scheduler.toastScheduled);
  };

  const handlePublishNow = async (post: ScheduledPost) => {
    setPublishingId(post.id);
    setPublishError(null);
    try {
      const res = await fetch("/api/social/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: post.platform,
          content: post.content,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Publish failed");
      }
      onMarkPublished(post.id);
      showToast(t.scheduler.toastPublished);
    } catch (err) {
      setPublishError(
        err instanceof Error ? err.message : "Publishing request failed."
      );
    } finally {
      setPublishingId(null);
    }
  };

  const toggleMockAccount = (id: string) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === id ? { ...acc, connected: !acc.connected } : acc
      )
    );
  };

  const filteredPosts =
    statusFilter === "all"
      ? posts
      : posts.filter((p) => p.status === statusFilter);

  return (
    <div className="space-y-6">
      {toast && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {publishError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{publishError}</span>
        </div>
      )}

      {/* Connected Accounts (Future Meta Graph API) */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3.5">
          <Link2 className="h-4 w-4 text-blue-600 shrink-0" />
          <h3 className="text-sm font-bold text-slate-900">
            {t.scheduler.connectedAccounts}
          </h3>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-bold uppercase text-blue-600">
                    {acc.provider}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={`font-semibold ${
                      acc.connected ? "text-emerald-700" : "text-slate-600"
                    }`}
                  >
                    {acc.connected
                      ? t.scheduler.connected
                      : t.scheduler.readyToConnect}
                  </span>
                  {acc.followersCount && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {acc.followersCount}
                      </span>
                    </>
                  )}
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-900 truncate">
                  {acc.accountName}
                </p>
                <p className="text-xs text-slate-500 truncate">{acc.handle}</p>
              </div>

              <button
                type="button"
                onClick={() => toggleMockAccount(acc.id)}
                className={`h-9 shrink-0 rounded-lg px-3.5 text-xs font-semibold transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-blue-600 ${
                  acc.connected
                    ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {acc.connected
                  ? t.scheduler.disconnectBtn
                  : t.scheduler.connectBtn}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Main Split: Form + Queue */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        <form
          onSubmit={handleSchedule}
          className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600 shrink-0" />
            <h3 className="text-base font-bold text-slate-900">
              {t.scheduler.newPost}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.scheduler.platform}
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as SocialPlatform)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.scheduler.dateTime}
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 font-mono text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.scheduler.postContent}
            </label>
            <textarea
              rows={5}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t.scheduler.postPlaceholder}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.scheduler.mediaNote}
            </label>
            <input
              type="text"
              value={mediaNote}
              onChange={(e) => setMediaNote(e.target.value)}
              placeholder="e.g., promo-banner.png"
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>{t.scheduler.scheduleBtn}</span>
          </button>
        </form>

        {/* Queue List */}
        <div className="space-y-4 lg:col-span-7">
          {/* Interactive Segmented Status Filter */}
          <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
            {(["all", "scheduled", "published"] as const).map((status) => (
              <button
                type="button"
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  statusFilter === status
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {status === "all"
                  ? t.scheduler.filterAll
                  : t.scheduler.statuses[status]}
              </button>
            ))}
          </div>

          {filteredPosts.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
              <p className="text-sm font-semibold text-slate-900">
                {t.scheduler.emptyTitle}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {t.scheduler.emptyDesc}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-bold uppercase text-blue-600">
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
                      <span
                        className={`font-semibold ${
                          post.status === "published"
                            ? "text-emerald-700"
                            : "text-blue-700"
                        }`}
                      >
                        {t.scheduler.statuses[post.status]}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-800">
                    {post.content}
                  </p>

                  {post.mediaNote && (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <Paperclip className="h-3.5 w-3.5 shrink-0" />
                      <span>{post.mediaNote}</span>
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                    {post.status !== "published" && (
                      <button
                        type="button"
                        onClick={() => handlePublishNow(post)}
                        disabled={publishingId === post.id}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-blue-600"
                      >
                        {publishingId === post.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                        ) : (
                          <Send className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span>
                          {publishingId === post.id
                            ? t.scheduler.publishing
                            : t.scheduler.publishNow}
                        </span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onDeletePost(post.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-red-600"
                      aria-label={t.scheduler.delete}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
