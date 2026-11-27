import React, { useEffect, useState } from "react";
import type {
  Language,
  NavSection,
  PlannerItem,
  PlannerStatus,
  ScheduledPost,
  SocialPlatform,
} from "./types/index.ts";
import { getTranslation } from "./lib/i18n.ts";
import { Sidebar } from "./components/Sidebar.tsx";
import { Header } from "./components/Header.tsx";
import { OverviewDashboard } from "./components/OverviewDashboard.tsx";
import { AIToolWorkspace } from "./components/AIToolWorkspace.tsx";
import { ContentPlanner } from "./components/ContentPlanner.tsx";
import { SchedulingDashboard } from "./components/SchedulingDashboard.tsx";

const INITIAL_PLANNER: PlannerItem[] = [
  {
    id: "pl-1",
    title: "Q4 Product Launch Carousel",
    platform: "instagram",
    pillar: "Product",
    targetDate: "2026-12-01",
    status: "ready",
    notes: "Highlight 3 core time-saving benefits with clean blue visuals.",
  },
  {
    id: "pl-2",
    title: "30s Behind-the-Scenes Workflow Reel",
    platform: "tiktok",
    pillar: "Behind the Scenes",
    targetDate: "2026-12-03",
    status: "draft",
    notes: "Fast-paced hook + quick screen recording.",
  },
];

const INITIAL_SCHEDULED: ScheduledPost[] = [
  {
    id: "sc-1",
    platform: "facebook",
    accountName: "SocialTools Official Page",
    content:
      "Save 5+ hours every week planning your content calendar with AI. Try our bilingual content studio today!",
    scheduledAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    status: "scheduled",
  },
  {
    id: "sc-2",
    platform: "instagram",
    accountName: "Instagram Business",
    content:
      "Consistency beats intensity. Build a repeatable weekly workflow ✨ #ContentStrategy #SocialGrowth",
    scheduledAt: new Date(Date.now() - 86400000).toISOString().slice(0, 16),
    status: "published",
  },
];

function safeReadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [lang, setLang] = useState<Language>("en");
  const [activeSection, setActiveSection] = useState<NavSection>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [liveAiConfigured, setLiveAiConfigured] = useState(false);

  const [plannerItems, setPlannerItems] = useState<PlannerItem[]>(() =>
    safeReadStorage("sth_planner", INITIAL_PLANNER)
  );
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>(() =>
    safeReadStorage("sth_schedule", INITIAL_SCHEDULED)
  );
  const [schedulerPrefill, setSchedulerPrefill] = useState<{
    platform: SocialPlatform;
    content: string;
  } | null>(null);

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    fetch("/api/generate")
      .then((r) => r.json())
      .then((d: { liveAiConfigured?: boolean }) =>
        setLiveAiConfigured(Boolean(d.liveAiConfigured))
      )
      .catch(() => setLiveAiConfigured(false));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("sth_planner", JSON.stringify(plannerItems));
    } catch {
      // Ignore storage quota errors
    }
  }, [plannerItems]);

  useEffect(() => {
    try {
      localStorage.setItem("sth_schedule", JSON.stringify(scheduledPosts));
    } catch {
      // Ignore storage quota errors
    }
  }, [scheduledPosts]);

  const t = getTranslation(lang);

  const pageTitleMap: Record<NavSection, string> = {
    overview: t.nav.overview,
    facebook: t.nav.facebook,
    instagram: t.nav.instagram,
    hashtags: t.nav.hashtags,
    tiktok: t.nav.tiktok,
    youtube: t.nav.youtube,
    planner: t.nav.planner,
    scheduler: t.nav.scheduler,
  };

  const handleSendToScheduler = (platform: SocialPlatform, content: string) => {
    setSchedulerPrefill({ platform, content });
    setActiveSection("scheduler");
  };

  const handleAddToPlannerFromAI = (
    platform: SocialPlatform,
    title: string,
    notes: string
  ) => {
    setPlannerItems((prev) => [
      {
        id: `pl-${Date.now()}`,
        title,
        platform,
        pillar: lang === "ar" ? "توليد ذكي" : "AI Generated",
        targetDate: new Date().toISOString().split("T")[0],
        status: "ready",
        notes,
      },
      ...prev,
    ]);
    setActiveSection("planner");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        lang={lang}
        activeSection={activeSection}
        onSelect={setActiveSection}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          lang={lang}
          onToggleLang={() => setLang((prev) => (prev === "en" ? "ar" : "en"))}
          onOpenMobileMenu={() => setMobileOpen(true)}
          pageTitle={pageTitleMap[activeSection]}
        />

        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">
          {activeSection === "overview" && (
            <OverviewDashboard
              lang={lang}
              plannerItems={plannerItems}
              scheduledPosts={scheduledPosts}
              onNavigate={setActiveSection}
            />
          )}

          {(activeSection === "facebook" ||
            activeSection === "instagram" ||
            activeSection === "hashtags" ||
            activeSection === "tiktok" ||
            activeSection === "youtube") && (
            <AIToolWorkspace
              key={activeSection}
              tool={activeSection}
              lang={lang}
              liveAiConfigured={liveAiConfigured}
              onSendToScheduler={handleSendToScheduler}
              onAddToPlanner={handleAddToPlannerFromAI}
            />
          )}

          {activeSection === "planner" && (
            <ContentPlanner
              lang={lang}
              items={plannerItems}
              onAddItem={(item) =>
                setPlannerItems((prev) => [
                  { ...item, id: `pl-${Date.now()}` },
                  ...prev,
                ])
              }
              onUpdateStatus={(id, status: PlannerStatus) =>
                setPlannerItems((prev) =>
                  prev.map((i) => (i.id === id ? { ...i, status } : i))
                )
              }
              onDeleteItem={(id) =>
                setPlannerItems((prev) => prev.filter((i) => i.id !== id))
              }
              onPushToScheduler={handleSendToScheduler}
            />
          )}

          {activeSection === "scheduler" && (
            <SchedulingDashboard
              lang={lang}
              posts={scheduledPosts}
              prefill={schedulerPrefill}
              onClearPrefill={() => setSchedulerPrefill(null)}
              onAddPost={(post) =>
                setScheduledPosts((prev) => [
                  { ...post, id: `sc-${Date.now()}` },
                  ...prev,
                ])
              }
              onMarkPublished={(id) =>
                setScheduledPosts((prev) =>
                  prev.map((p) =>
                    p.id === id ? { ...p, status: "published" } : p
                  )
                )
              }
              onDeletePost={(id) =>
                setScheduledPosts((prev) => prev.filter((p) => p.id !== id))
              }
            />
          )}
        </main>
      </div>
    </div>
  );
}
