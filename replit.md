# App Template (Everysk)

## Overview
A React + TypeScript + Vite frontend application template. Uses MUI, Tailwind CSS, TanStack Query, and wouter for routing. Designed as a template for building Everysk platform applications.

## Project Architecture
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4 + MUI (Material UI) 7
- **State/Data**: TanStack React Query, Axios
- **Routing**: wouter
- **Dev Proxy**: Vite dev server proxies `/api` requests to the Everysk API

## Project Structure
- `src/` - Application source code
  - `components/` - Reusable UI components
  - `contexts/` - React context providers
  - `hooks/` - Custom React hooks
  - `pages/` - Page components
  - `types/` - TypeScript type definitions
  - `utils/` - Utility functions and API helpers
- `vite/` - Custom Vite plugins (env vars, dev app config, server proxy)
- `dev/` - Development configuration files
- `public/` - Static assets

## Environment Variables (Replit Secrets)

This app requires three secrets to connect to the Everysk API. Add them in the **Secrets** tab (lock icon in the left sidebar):

| Secret | Required | Description |
|--------|----------|-------------|
| `EVERYSK_API_SID` | **Yes** | Your Everysk API account SID |
| `EVERYSK_API_TOKEN` | **Yes** | Your Everysk API authentication token |
| `EVERYSK_APP_NAME` | **Yes** | Your Everysk application name (used during deploy) |

Get your credentials from: https://everysk.com/account

### Setup Steps

1. Click the **Secrets** tab (lock icon) in the left sidebar
2. Add `EVERYSK_API_SID` with your API SID value
3. Add `EVERYSK_API_TOKEN` with your API token value
4. Add `EVERYSK_APP_NAME` with your Everysk application name
5. Click **Run** — the app validates secrets on startup and will tell you if anything is missing

## AI Integration (Anthropic Claude)
- **Provider**: Anthropic directly (user's own API key)
- **SDK**: `@anthropic-ai/sdk`
- **Environment Variables**:
  - `ANTHROPIC_API_KEY` (user-provided, stored in Replit Secrets)
- **Available Models**: claude-opus-4-6, claude-sonnet-4-6, claude-haiku-4-5
- **Reference Files**: `.replit_integration_files/` contains template code for chat routes, batch processing, and storage patterns

### Usage Example
```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const message = await anthropic.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello!" }],
});
```

## Agent Preferences

- **Always read `replit.md` before starting or restarting any workflow.** This file contains required secrets, setup steps, and project context that must be reviewed before running the app. Do not start workflows blindly.
- **On first run / initial setup / import:** Before starting any workflow, use the environment-secrets skill to check whether the required secrets (`EVERYSK_API_SID`, `EVERYSK_API_TOKEN`, and `EVERYSK_APP_NAME`) exist. If any are missing, immediately use `requestEnvVar` to prompt the user for all missing secrets — do NOT just tell the user to add them manually. Always proactively request them programmatically so the user gets an interactive prompt. Do not start workflows without these secrets — the app will fail with a clear error from `scripts/check-env.sh`.
- **Always use Anthropic (Claude) via the user's own API key** for any AI/chat features in the app. Use the SDK and `ANTHROPIC_API_KEY` environment variable documented above.
- **Never modify the `.replit` file or its workflows.** The `Project`, `Start application`, and `Deploy App` workflows are pre-configured and must not be changed. Port `5000` is required and hardcoded in `.replit`. Modifying `.replit` will break Replit's Run button and the Deploy workflow for every user who imports this template.
- **Never run the "Deploy App" workflow automatically.** The `Deploy App` workflow runs `scripts/replit-deploy.sh` which deploys to **production**. It must ONLY be triggered when the user explicitly clicks "Deploy App" in the Replit Workflows tab. Do not run it on repo import, during initial setup, on first run, or as part of any automated or initialization step. The only workflow that should run on import or startup is **"Project"** (which starts the dev server).

### Required Agent Skills (MANDATORY — Every Conversation)

**IMPORTANT:** The following agent skills **must** be loaded and used in every conversation, every new session, and on every fresh app import. These skills are installed in `.agents/skills/` and persist across all copies of this template. The agent must read and follow the relevant SKILL.md file before performing any work that matches the "When to Use" criteria.

| Skill | Path | When to Use |
|-------|------|-------------|
| **everysk-api** | `.agents/skills/everysk-api` | **Every conversation, every prompt, every session.** Comprehensive Everysk platform reference — REST API v2, Python SDK entities (Portfolio, Datastore, Report, File, CustomIndex, PrivateSecurity), 6 engines (MarketData, UserCache, Compliance, ExpressionEngine, UserLock, Cryptography), 13 core modules, WorkerBase patterns, 7 calculation endpoints, server/deployment, and 2026 brand identity (colors, typography, voice). **MANDATORY: Load SKILL.md AND read ALL 7 reference files** (7,690 total lines) on every invocation. All apps built from this template run on Everysk. |
| **brainstorming** | `.agents/skills/brainstorming` | **Before any creative work** — creating features, building components, adding functionality, or modifying behavior. Always explore user intent, requirements, and design before implementation. |
| **frontend-design** | `.agents/skills/frontend-design` | When building or styling any UI — web components, pages, dashboards, layouts. Produces polished, production-grade interfaces. **Must follow Everysk brand guidelines** from everysk-api branding reference. |
| **agent-tools** | `.agents/skills/agent-tools` | When running AI apps via inference.sh CLI — image generation, video creation, LLMs, search, 3D, Twitter automation (FLUX, Veo, Gemini, Grok, Claude, etc.). |
| **pdf** | `.agents/skills/pdf` | When doing anything with PDF files — reading, merging, splitting, creating, filling forms, OCR, watermarks, encryption. |
| **find-skills** | `.agents/skills/find-skills` | When the user asks "how do I do X" or looks for functionality that might exist as an installable skill. |
| **ui-ux-pro-max** | `.agents/skills/ui-ux-pro-max` | When building or styling any React UI — comprehensive design system data (colors, typography, icons, charts, component patterns). Use alongside `frontend-design` and the Everysk branding reference. |
| **systematic-debugging** | `.agents/skills/systematic-debugging` | When debugging any error, test failure, or unexpected behavior. Root-cause tracing, test pressure analysis, condition-based waiting patterns, and defense-in-depth. |
| **vercel-react-best-practices** | `.agents/skills/vercel-react-best-practices` | When reviewing or optimizing React component performance. 50+ rules covering rendering, re-renders, async boundaries, bundle optimization, and JS patterns. |
| **browser-use** | `.agents/skills/browser-use` | When automating browser interactions — screenshots, form fills, navigation, UI testing within the agent. |

**Mandatory Rules (apply to every conversation, including new sessions and fresh imports):**
- Always load the **everysk-api** skill at the start of **every conversation without exception** — this template is an Everysk platform app and all work requires platform knowledge. Do NOT skip this step, even for simple questions. **You MUST also read ALL 7 reference files** in `.agents/skills/everysk-api/references/` (sdk-entities, sdk-engines, core, api-reference, server, worker-patterns, branding) — these are not optional progressive-disclosure files, they are mandatory context for every session.
- Always load the **brainstorming** skill before starting any creative or feature-building work. Do NOT skip this step.
- Always load the **frontend-design** skill when building or modifying any UI component or page. **Follow the Everysk 2026 brand guidelines** from the everysk-api branding reference (colors: #F2703B orange, #C9DDE8 blue, #A49F8C gray; fonts: Playfair Display/Space Grotesk/DM Sans).
- Always load the **agent-tools** skill when running AI model inference, image/video generation, or web search via CLI.
- Always load the **pdf** skill when the user mentions `.pdf` files or asks to produce/manipulate PDFs.
- Always load the **find-skills** skill when the user asks about discovering new capabilities or extending functionality.
- These rules apply to **every conversation** — not just the first one. On every new conversation or fresh import, re-read this section and follow the skill requirements.
- Always load the **ui-ux-pro-max** skill when building or modifying React UI components, alongside **frontend-design** and the Everysk branding reference from `everysk-api`.
- Always load the **systematic-debugging** skill when encountering any error, bug, or unexpected behavior — before attempting a fix.
- Always load the **vercel-react-best-practices** skill before writing or reviewing React components to apply performance best practices.
- Always load the **browser-use** skill when performing any browser automation or UI interaction tasks.

### Key files:
- `src/hooks/useFetchPortfolio.tsx` — TanStack Query hook for fetching portfolios
- `src/hooks/usePortfolioMutations.tsx` — Mutation hook for portfolio CRUD
- `src/hooks/useFetchDatastore.tsx` — TanStack Query hook for fetching datastores
- `src/hooks/useDatastoreMutations.tsx` — Mutation hook for datastore CRUD
- `src/hooks/useFetchWorkspaces.tsx` — TanStack Query hook for fetching workspaces
- `src/hooks/useFetchWorkflows.tsx` — TanStack Query hook for fetching workflows by workspace
- `src/hooks/useFetchWorkflowExecutions.tsx` — TanStack Query hook using `useQueries` to fetch executions per-workflow
- `src/utils/api/workflowList.ts` — API utility functions for listing workflows and workflow executions
- `src/types/workflow.ts` — TypeScript types for Workflow and WorkflowExecution entities

### API Endpoints Used:
- `GET /workspaces` — List all workspaces
- `GET /portfolios` — List portfolios (with workspace filter)
- `POST /portfolios` — Create a portfolio
- `DELETE /portfolios/{id}` — Delete a portfolio
- `GET /datastores` — List datastores (with workspace filter)
- `POST /datastores` — Create a datastore
- `DELETE /datastores/{id}` — Delete a datastore
- `GET /workflows?workspace={name}` — List workflows in a workspace (workspace must be a direct query param, NOT inside a JSON `query` string)
- `GET /workflows/{workflow_id}/workflow_executions` — List executions for a specific workflow (the standalone `/workflow_executions` endpoint does NOT exist)

## Running
- Dev server: `bash scripts/check-env.sh && npm run dev` (port 5000) — validates secrets before starting Vite
- Build: `npm run build` (outputs to `dist/`)
- Deploy: Use the "Deploy App" workflow in Replit (runs `scripts/replit-deploy.sh`)
  - Automatically installs Python dependencies from `requirements.txt` before building
  - Builds the frontend, packages the `dist/` directory, and deploys to the Everysk API
  - Equivalent to the GitHub Actions workflow in `.github/workflows/deploy.yaml`
  - Requires `EVERYSK_API_SID`, `EVERYSK_API_TOKEN`, and `EVERYSK_APP_NAME` secrets

## Dev Configuration

The file `dev/app-config.dev.json` configures the frontend for local development. It is served by the Vite dev server at `/app-config.dev.json` and merged into `window.APP_CONFIG` on startup.

**Sync this file whenever `EVERYSK_APP_NAME` is set or changed:**

```json
{
  "app": "your-everysk-app-name"
}
```

- Set `"app"` to the same value as your `EVERYSK_APP_NAME` secret
- This controls `window.APP_CONFIG.app` in development (production reads config from build metadata)
- The browser tab title is set from `EVERYSK_APP_NAME` automatically at both dev and build time — no manual title update needed

## Deploy Prerequisites
- **Python dependencies** (`requirements.txt`): `requests`, `python-dotenv`, `everysk-lib`, `httpx` — installed automatically by `scripts/replit-deploy.sh` before each deploy
- **Node build**: `npm run build` must complete without errors. Use `ReactElement` (not `ReactNode`) for MUI `Chip` `icon` props and similar typed element props
- If adding new Python dependencies needed by deploy scripts, add them to `requirements.txt` — the deploy script runs `pip install -q -r requirements.txt` automatically
