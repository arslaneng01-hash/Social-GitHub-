export type Language = "en" | "ar";

export type NavSection =
  | "overview"
  | "facebook"
  | "instagram"
  | "hashtags"
  | "tiktok"
  | "youtube"
  | "planner"
  | "scheduler";

export type SocialPlatform = "facebook" | "instagram" | "tiktok" | "youtube";

export type AIToolType = "facebook" | "instagram" | "hashtags" | "tiktok" | "youtube";

export type ToneOption =
  | "professional"
  | "engaging"
  | "friendly"
  | "persuasive"
  | "humorous";

export interface GenerateRequest {
  tool: AIToolType;
  language: Language;
  topic: string;
  tone: ToneOption;
  audience?: string;
  extraOption?: string;
}

export interface GenerateSection {
  label: string;
  content: string;
}

export interface GenerateResponse {
  mode: "live-ai" | "sample-demo";
  tool: AIToolType;
  sections: GenerateSection[];
  hashtags?: string[];
  rawText: string;
}

export type PlannerStatus = "idea" | "draft" | "ready" | "scheduled";

export interface PlannerItem {
  id: string;
  title: string;
  platform: SocialPlatform;
  pillar: string;
  targetDate: string;
  status: PlannerStatus;
  notes: string;
}

export type ScheduledStatus = "scheduled" | "published" | "draft";

export interface ScheduledPost {
  id: string;
  platform: SocialPlatform;
  accountName: string;
  content: string;
  scheduledAt: string;
  status: ScheduledStatus;
  mediaNote?: string;
}

export interface SocialAccountConnection {
  id: string;
  provider: "facebook" | "instagram";
  accountName: string;
  handle: string;
  connected: boolean;
  followersCount?: string;
}
