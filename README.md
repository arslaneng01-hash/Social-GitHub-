# SocialTools Hub

Bilingual (English & Arabic RTL/LTR) AI Social Media Content Studio, Campaign Planner, and Post Scheduling Dashboard built with React, TypeScript, Tailwind CSS, and Express.

## Features

- **5 AI Content Generators** (`/api/generate`): Facebook Posts, Instagram Captions, Hashtag Generator, TikTok Scripts, and YouTube SEO Titles & Descriptions. Uses Google Gemini (`@google/genai`) or OpenAI when configured on the server, and automatically runs in bilingual Smart Sample AI mode when no key is set.
- **Full English & Arabic (RTL/LTR)** support with instant switching.
- **Content Planner**: Organize ideas, pillars, target dates, and production stages (`Idea` → `Drafting` → `Ready` → `Scheduled`) with `localStorage` persistence.
- **Post Scheduling Dashboard**: Manage scheduled/published queues, prepare Meta Graph API account connections, and test publishing via `/api/social/publish`.
- **ZIP Export**: Download the complete ready-to-deploy source archive via `/api/export-zip`.

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables (Server-Side Only)

Configure in `.env` locally or in your hosting provider's environment settings:

- `GEMINI_API_KEY` (optional): Enables live Gemini AI generation.
- `OPENAI_API_KEY` (optional): Alternative live AI provider.
- `META_APP_ID`, `META_APP_SECRET`, `META_REDIRECT_URI` (optional): Enables official Meta Graph API OAuth & Facebook/Instagram publishing.
- `PORT` (optional): Defaults to `3000`.

## Free Hosting Deployment

### Option 1: Render (Recommended Free Web Service)

1. Push this project to a GitHub repository (or use the included `render.yaml` Blueprint).
2. On [Render](https://render.com), create a **New Web Service** connected to your repository:
   - **Runtime**: Node (Node 22+)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**: Add `NODE_ENV=production` and optionally `GEMINI_API_KEY`.

### Option 2: Railway / Koyeb / Fly.io

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- Ensure Node.js `>= 22.18` is selected so `node server.ts` executes directly.
