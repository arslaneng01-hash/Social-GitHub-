/**
 * SocialTools Hub - Official Meta Graph API Integration Architecture
 *
 * Isolates OAuth & Graph API publishing logic strictly on the server.
 * When META_APP_ID and META_APP_SECRET are configured, live Graph API
 * requests are executed.
 */

export interface MetaPublishPayload {
  platform: "facebook" | "instagram";
  pageOrAccountId: string;
  accessToken: string;
  message: string;
  imageUrl?: string;
  scheduledUnixTime?: number;
}

export interface MetaPublishResult {
  success: boolean;
  simulated: boolean;
  externalPostId: string;
  message: string;
}

const META_GRAPH_VERSION = "v21.0";
const META_BASE_URL = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

export function buildMetaOAuthUrl(state: string): string {
  const appId = process.env.META_APP_ID || "YOUR_META_APP_ID";
  const baseUrl = process.env.APP_URL || "http://localhost:3000";
  const redirectUri = encodeURIComponent(
    process.env.META_REDIRECT_URI || `${baseUrl}/api/social/meta/callback`
  );
  const scopes = [
    "pages_show_list",
    "pages_read_engagement",
    "pages_manage_posts",
    "instagram_basic",
    "instagram_content_publish",
  ].join(",");

  return `https://www.facebook.com/${META_GRAPH_VERSION}/dialog/oauth?client_id=${encodeURIComponent(appId)}&redirect_uri=${redirectUri}&state=${encodeURIComponent(state)}&scope=${encodeURIComponent(scopes)}`;
}

export async function publishToMetaGraph(
  payload: MetaPublishPayload
): Promise<MetaPublishResult> {
  const isConfigured = Boolean(
    process.env.META_APP_ID && process.env.META_APP_SECRET
  );

  if (!isConfigured || payload.accessToken === "DEMO_TOKEN") {
    return {
      success: true,
      simulated: true,
      externalPostId: `meta_demo_${Date.now()}`,
      message: `Simulated ${payload.platform} publish succeeded. Configure META_APP_ID & META_APP_SECRET for live Graph API publishing.`,
    };
  }

  if (payload.platform === "facebook") {
    const endpoint = `${META_BASE_URL}/${encodeURIComponent(payload.pageOrAccountId)}/feed`;
    const body: Record<string, string | number | boolean> = {
      message: payload.message,
      access_token: payload.accessToken,
    };

    if (payload.scheduledUnixTime) {
      body.published = false;
      body.scheduled_publish_time = payload.scheduledUnixTime;
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = (await res.json()) as {
      id?: string;
      error?: { message?: string };
    };
    if (!res.ok) {
      throw new Error(data?.error?.message || "Facebook Graph API error");
    }

    return {
      success: true,
      simulated: false,
      externalPostId: data.id || `fb_${Date.now()}`,
      message: "Published via Facebook Graph API",
    };
  }

  throw new Error(
    "Live Instagram publishing requires a public imageUrl for container creation."
  );
}
