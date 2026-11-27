import "dotenv/config";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import JSZip from "jszip";
import { generateFallbackContent } from "./src/lib/ai-fallback.ts";
import {
  buildMetaOAuthUrl,
  publishToMetaGraph,
} from "./src/lib/social-providers/meta.ts";
import type {
  AIToolType,
  GenerateRequest,
  GenerateResponse,
  Language,
  SocialPlatform,
  ToneOption,
} from "./src/types/index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VALID_TOOLS = new Set<AIToolType>([
  "facebook",
  "instagram",
  "hashtags",
  "tiktok",
  "youtube",
]);

const VALID_LANGUAGES = new Set<Language>(["en", "ar"]);

const VALID_TONES = new Set<ToneOption>([
  "professional",
  "engaging",
  "friendly",
  "persuasive",
  "humorous",
]);

const VALID_PLATFORMS = new Set<SocialPlatform>([
  "facebook",
  "instagram",
  "tiktok",
  "youtube",
]);

const TOOL_PROMPTS: Record<AIToolType, string> = {
  facebook:
    "Write a high-converting Facebook post with a strong hook, clear value points, and a compelling CTA. Also provide a short engagement tip as a second section.",
  instagram:
    "Provide 3 distinct Instagram caption variations (Short & Punchy, Storytelling, and Engagement Question) as 3 sections, plus 5 relevant hashtags in the hashtags array.",
  hashtags:
    "Generate 15 strategic hashtags grouped into 3 sections: High-Reach Hashtags, Targeted Niche Hashtags, and Community & Engagement Hashtags, and list all 15 in the hashtags array.",
  tiktok:
    "Write a structured TikTok video script divided into 3 sections: The Hook (0-3s), Script Body & Visual Cues, and Call to Action (Outro).",
  youtube:
    "Generate 2 sections: 5 High-CTR SEO Titles (numbered 1 to 5) and 1 structured SEO Video Description with chapter timestamps.",
};

function getConfiguredGeminiKey(): string | undefined {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key || key === "MY_GEMINI_API_KEY") return undefined;
  return key;
}

function getConfiguredOpenAIKey(): string | undefined {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return undefined;
  return key;
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "256kb" }));

  // Status check for AI & Meta API readiness
  app.get("/api/generate", (_req, res) => {
    const geminiConfigured = Boolean(getConfiguredGeminiKey());
    const openaiConfigured = Boolean(getConfiguredOpenAIKey());
    res.json({
      liveAiConfigured: geminiConfigured || openaiConfigured,
      provider: geminiConfigured
        ? "gemini"
        : openaiConfigured
          ? "openai"
          : "sample-demo",
      metaApiConfigured: Boolean(
        process.env.META_APP_ID && process.env.META_APP_SECRET
      ),
    });
  });

  // Server-side AI content generation
  app.post("/api/generate", async (req, res) => {
    try {
      const body = req.body as Partial<GenerateRequest>;

      if (
        !body ||
        typeof body.topic !== "string" ||
        !body.topic.trim() ||
        body.topic.length > 1000
      ) {
        res.status(400).json({
          error: "A valid topic (1–1000 characters) is required.",
        });
        return;
      }

      if (!body.tool || !VALID_TOOLS.has(body.tool)) {
        res.status(400).json({ error: "Invalid AI tool specified." });
        return;
      }

      const language: Language =
        body.language && VALID_LANGUAGES.has(body.language)
          ? body.language
          : "en";
      const tone: ToneOption =
        body.tone && VALID_TONES.has(body.tone) ? body.tone : "engaging";
      const audience =
        typeof body.audience === "string" ? body.audience.slice(0, 200) : "";
      const extraOption =
        typeof body.extraOption === "string"
          ? body.extraOption.slice(0, 200)
          : "";

      const validatedRequest: GenerateRequest = {
        tool: body.tool,
        language,
        topic: body.topic.trim(),
        tone,
        audience,
        extraOption,
      };

      const geminiKey = getConfiguredGeminiKey();
      const openaiKey = getConfiguredOpenAIKey();

      // Primary live AI path: Gemini via @google/genai
      if (geminiKey) {
        const ai = new GoogleGenAI({
          apiKey: geminiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });

        const langInstruction =
          language === "ar"
            ? "Respond entirely in natural, modern Arabic (including section labels and content)."
            : "Respond in clear, engaging English.";

        const systemInstruction = `You are SocialTools Hub AI, an expert social media strategist. ${langInstruction} Return structured JSON matching the requested schema.`;

        const prompt = `Task: ${TOOL_PROMPTS[validatedRequest.tool]}
Topic: ${validatedRequest.topic}
Tone: ${validatedRequest.tone}
Target Audience: ${validatedRequest.audience || "General social media audience"}
Extra Context: ${validatedRequest.extraOption || "None"}`;

        const response = await ai.models.generateContent({
          model: "gemini-4-hydrogen",
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                sections: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      content: { type: Type.STRING },
                    },
                    required: ["label", "content"],
                  },
                },
                hashtags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                rawText: { type: Type.STRING },
              },
              required: ["sections", "rawText"],
            },
          },
        });

        const rawJson = (response.text ?? "{}").trim();
        const parsed = JSON.parse(rawJson) as {
          sections?: { label: string; content: string }[];
          hashtags?: string[];
          rawText?: string;
        };

        const result: GenerateResponse = {
          mode: "live-ai",
          tool: validatedRequest.tool,
          sections: Array.isArray(parsed.sections) ? parsed.sections : [],
          hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : undefined,
          rawText:
            parsed.rawText ||
            (parsed.sections || []).map((s) => s.content).join("\n\n"),
        };

        res.json(result);
        return;
      }

      // Secondary optional OpenAI path if configured
      if (openaiKey) {
        const langInstruction =
          language === "ar"
            ? "Respond entirely in natural, modern Arabic."
            : "Respond in clear, engaging English.";

        const systemPrompt = `You are SocialTools Hub AI, an expert social media strategist. ${langInstruction}
Return strict JSON matching this schema:
{
  "sections": [{ "label": "string", "content": "string" }],
  "hashtags": ["string"],
  "rawText": "combined ready-to-copy post text"
}`;

        const userPrompt = `Task: ${TOOL_PROMPTS[validatedRequest.tool]}
Topic: ${validatedRequest.topic}
Tone: ${validatedRequest.tone}
Target Audience: ${validatedRequest.audience || "General social media audience"}
Extra Context: ${validatedRequest.extraOption || "None"}`;

        const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.7,
          }),
        });

        if (!aiRes.ok) {
          const errPayload = await aiRes.text();
          res.status(aiRes.status).json({
            error: `Upstream AI provider returned ${aiRes.status}: ${errPayload.slice(0, 200)}`,
          });
          return;
        }

        const aiData = (await aiRes.json()) as {
          choices: { message: { content: string } }[];
        };
        const parsed = JSON.parse(aiData.choices[0].message.content) as {
          sections?: { label: string; content: string }[];
          hashtags?: string[];
          rawText?: string;
        };

        const result: GenerateResponse = {
          mode: "live-ai",
          tool: validatedRequest.tool,
          sections: parsed.sections || [],
          hashtags: parsed.hashtags,
          rawText:
            parsed.rawText ||
            (parsed.sections || []).map((s) => s.content).join("\n\n"),
        };

        res.json(result);
        return;
      }

      // Smart Demo Mode fallback when no AI key is configured on the server
      await new Promise((r) => setTimeout(r, 350));
      const fallback = generateFallbackContent(validatedRequest);
      res.json(fallback);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to generate content.";
      res.status(500).json({ error: message });
    }
  });

  // Meta OAuth URL builder endpoint
  app.get("/api/social/meta/oauth-url", (_req, res) => {
    const state = `sth_${Date.now()}`;
    res.json({
      configured: Boolean(
        process.env.META_APP_ID && process.env.META_APP_SECRET
      ),
      oauthUrl: buildMetaOAuthUrl(state),
    });
  });

  // Server-side Meta / Social Publishing endpoint
  app.post("/api/social/publish", async (req, res) => {
    try {
      const body = req.body as {
        platform?: SocialPlatform;
        content?: string;
      };

      if (!body.platform || !VALID_PLATFORMS.has(body.platform)) {
        res.status(400).json({ error: "Valid social platform is required." });
        return;
      }

      if (
        typeof body.content !== "string" ||
        !body.content.trim() ||
        body.content.length > 5000
      ) {
        res.status(400).json({
          error: "Post content (1–5000 characters) is required.",
        });
        return;
      }

      if (body.platform === "facebook" || body.platform === "instagram") {
        const result = await publishToMetaGraph({
          platform: body.platform,
          pageOrAccountId: "DEMO_PAGE_ID",
          accessToken: "DEMO_TOKEN",
          message: body.content.trim(),
        });
        res.json(result);
        return;
      }

      res.json({
        success: true,
        simulated: true,
        externalPostId: `${body.platform}_demo_${Date.now()}`,
        message: `Publish prepared for ${body.platform}.`,
      });
    } catch (err) {
      res.status(500).json({
        error:
          err instanceof Error ? err.message : "Publishing request failed.",
      });
    }
  });

  // Project source ZIP download endpoint (strictly allowlisted, excludes secrets & build artifacts)
  app.get("/api/export-zip", async (_req, res) => {
    try {
      const zip = new JSZip();
      const rootFolder = zip.folder("socialtools-hub");
      if (!rootFolder) {
        res.status(500).json({ error: "Failed to initialize ZIP archive." });
        return;
      }

      const projectRoot = path.resolve(__dirname);
      const allowlistedRootFiles = [
        "index.html",
        "package.json",
        "tsconfig.json",
        "vite.config.ts",
        "server.ts",
        ".env.example",
        ".gitignore",
        "metadata.json",
        "README.md",
        "render.yaml",
      ];

      for (const fileName of allowlistedRootFiles) {
        const filePath = path.resolve(projectRoot, fileName);
        if (
          filePath.startsWith(projectRoot + path.sep) &&
          fs.existsSync(filePath)
        ) {
          const stat = fs.lstatSync(filePath);
          if (stat.isFile() && !stat.isSymbolicLink()) {
            rootFolder.file(fileName, fs.readFileSync(filePath));
          }
        }
      }

      const srcRoot = path.resolve(projectRoot, "src");
      const addDirectoryToZip = (dirPath: string, relativeBase: string) => {
        if (!fs.existsSync(dirPath)) return;
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.name.startsWith(".")) continue;
          const fullPath = path.resolve(dirPath, entry.name);
          if (!fullPath.startsWith(srcRoot + path.sep)) continue;
          const stat = fs.lstatSync(fullPath);
          if (stat.isSymbolicLink()) continue;

          const zipRelativePath = `${relativeBase}/${entry.name}`;
          if (stat.isDirectory()) {
            addDirectoryToZip(fullPath, zipRelativePath);
          } else if (stat.isFile()) {
            rootFolder.file(zipRelativePath, fs.readFileSync(fullPath));
          }
        }
      };

      addDirectoryToZip(srcRoot, "src");

      const buffer = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });

      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="socialtools-hub.zip"'
      );
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.send(buffer);
    } catch (err) {
      res.status(500).json({
        error:
          err instanceof Error
            ? err.message
            : "Failed to build project ZIP archive.",
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.get("*", (_req, res) => {
      const indexFile = path.join(distDir, "index.html");
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send("Build output not found.");
      }
    });
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`SocialTools Hub running on http://localhost:${port}`);
  });
}

startServer();
