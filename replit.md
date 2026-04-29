# App Template (Everysk)

## ⛔ MANDATORY — Every `.ts` / `.tsx` edit

Before touching any `.ts` or `.tsx` file: create the co-located `.test.tsx`, run `npm test` (RED must happen first), only then implement. No exceptions — not for trivial changes, not for demos, not for "quick fixes." Full workflow: `.agents/skills/tdd/SKILL.md`.

`npm test` and `npm run lint` are **hard stops**: the task is not done until both pass.

## Required Agent Skills (MANDATORY — Every Conversation)

**IMPORTANT:** The following agent skills **must** be loaded and used in every conversation, every new session, and on every fresh app import. These skills are installed in `.agents/skills/` and persist across all copies of this template. The agent must read and follow the relevant SKILL.md file before performing any work that matches the "When to Use" criteria.

| Skill | Path | When to Use |
|-------|------|-------------|
| **tdd** | `.agents/skills/tdd` | **Before writing or modifying any `.ts` or `.tsx` file.** Enforces Red→Green→Refactor cycle, co-located test file convention, and deploy gate (`npm test` must pass). |
| **everysk-api** | `.agents/skills/everysk-api` | **Every conversation, every prompt, every session.** Comprehensive Everysk platform reference — REST API v2, Python SDK entities (Portfolio, Datastore, Report, File, CustomIndex, PrivateSecurity), 6 engines (MarketData, UserCache, Compliance, ExpressionEngine, UserLock, Cryptography), 13 core modules, WorkerBase patterns, 7 calculation endpoints, server/deployment, and 2026 brand identity (colors, typography, voice). **MANDATORY: Load SKILL.md AND read ALL 7 reference files** (7,690 total lines) on every invocation. All apps built from this template run on Everysk. |
| **everysk-utils** | `.agents/skills/everysk-utils` | **Before implementing any feature** that fetches or mutates Everysk entities (portfolios, datastores, files, workflows, workspaces), listens to or sends broadcast messages, uses app config or alerts, or wires providers. Contains all built-in hooks and providers — read it before writing any data or messaging code to avoid duplicating utilities that already exist. |
| **brainstorming** | `.agents/skills/brainstorming` | **Before any creative work** — creating features, building components, adding functionality, or modifying behavior. Always explore user intent, requirements, and design before implementation. |
| **frontend-design** | `.agents/skills/frontend-design` | When building or styling any UI — web components, pages, dashboards, layouts. Produces polished, production-grade interfaces. **Must follow Everysk brand guidelines** from everysk-api branding reference. |
| **ui-ux-pro-max** | `.agents/skills/ui-ux-pro-max` | When building or styling any React UI — comprehensive design system data (colors, typography, icons, charts, component patterns). Use alongside `frontend-design` and the Everysk branding reference. |
| **systematic-debugging** | `.agents/skills/systematic-debugging` | When debugging any error, test failure, or unexpected behavior. Root-cause tracing, test pressure analysis, condition-based waiting patterns, and defense-in-depth. |
| **vercel-react-best-practices** | `.agents/skills/vercel-react-best-practices` | When reviewing or optimizing React component performance. 50+ rules covering rendering, re-renders, async boundaries, bundle optimization, and JS patterns. |
| **agent-tools** | `.agents/skills/agent-tools` | When running AI apps via inference.sh CLI — image generation, video creation, LLMs, search, 3D, Twitter automation (FLUX, Veo, Gemini, Grok, Claude, etc.). |
| **pdf** | `.agents/skills/pdf` | When doing anything with PDF files — reading, merging, splitting, creating, filling forms, OCR, watermarks, encryption. |
| **browser-use** | `.agents/skills/browser-use` | When automating browser interactions — screenshots, form fills, navigation, UI testing within the agent. |
| **find-skills** | `.agents/skills/find-skills` | When the user asks "how do I do X" or looks for functionality that might exist as an installable skill. |

**Mandatory Rules (apply to every conversation, including new sessions and fresh imports):**
- Always load the **tdd** skill before writing or modifying **any** `.ts` or `.tsx` file. Write the failing test first, confirm RED, implement, confirm GREEN. Run `npm test` before any deploy.
- Always load the **everysk-api** skill at the start of **every conversation without exception** — this template is an Everysk platform app and all work requires platform knowledge. Do NOT skip this step, even for simple questions. **You MUST also read ALL 7 reference files** in `.agents/skills/everysk-api/references/` (sdk-entities, sdk-engines, core, api-reference, server, worker-patterns, branding) — these are not optional progressive-disclosure files, they are mandatory context for every session.
- Always load the **everysk-utils** skill before implementing any feature that reads/writes Everysk entities or handles messaging. **Never create custom fetch utilities, axios calls, or BroadcastChannel instances** — use the built-in hooks. If you create a `new BroadcastChannel(...)` directly, the broadcast communication will break. If you write a custom `axios.get("/portfolios")` instead of `useFetchPortfolios`, the data will bypass the cache and mutations won't invalidate correctly.
- Always load the **brainstorming** skill before starting any creative or feature-building work. Do NOT skip this step.
- Always load the **frontend-design** skill when building or modifying any UI component or page. **Follow the Everysk 2026 brand guidelines** from the everysk-api branding reference (colors: #F2703B orange, #C9DDE8 blue, #A49F8C gray; fonts: Playfair Display/Space Grotesk/DM Sans).
- Always load the **ui-ux-pro-max** skill when building or modifying React UI components, alongside **frontend-design** and the Everysk branding reference from `everysk-api`.
- Always load the **systematic-debugging** skill when encountering any error, bug, or unexpected behavior — before attempting a fix.
- Always load the **vercel-react-best-practices** skill before writing or reviewing React components to apply performance best practices.
- Always load the **agent-tools** skill when running AI model inference, image/video generation, or web search via CLI.
- Always load the **pdf** skill when the user mentions `.pdf` files or asks to produce/manipulate PDFs.
- Always load the **browser-use** skill when performing any browser automation or UI interaction tasks.
- Always load the **find-skills** skill when the user asks about discovering new capabilities or extending functionality.
- These rules apply to **every conversation** — not just the first one. On every new conversation or fresh import, re-read this section and follow the skill requirements.

---

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

> The mandatory agent skills list lives at the top of this file under "Required Agent Skills".

### Optional Components

Some providers in `src/contexts/` require extra packages not included in the base template. Install them only when you need the feature.

| Component | Path | Required Package | Install Command |
|-----------|------|-----------------|-----------------|
| `AgGridLicenseProvider` | `src/contexts/agGridLicenseContext/agGridLicenseProvider.tsx` | `ag-grid-enterprise` | `npm install ag-grid-enterprise` |

If the required package is absent, the provider degrades gracefully: children render normally without the feature.

---

### Hooks, Contexts & API — see the `everysk-utils` skill

All hooks (`useFetchPortfolios`, `usePortfolioMutations`, `useFetchDatastores`, `useDatastoreMutations`, `useFetchFiles`, `useFileMutations`, `useFetchWorkflows`, `useWorkflowRunMutations`, `useFetchWorkflowExecution(s)`, `useFetchWorkerExecution(s)`, `useFetchWorkspace(s)`, `useAxios`, `useAppAlert`, `useAppConfig`, `useBroadcastChannel`, `useBroadcastSubscription`), context providers (required nesting order, `AgGridLicenseProvider`), filter/order/projection/pagination patterns, broadcast message format, and the underlying `/api/...` endpoints (portfolios, datastores, workflows, workflow_executions, worker_executions, workspaces) are documented in **`.agents/skills/everysk-utils/SKILL.md`**. Read that skill before writing or modifying any code that talks to Everysk entities, broadcasts, alerts, or runtime config — and never bypass it with raw `axios`, `fetch`, `new BroadcastChannel(...)`, `alert()`, or direct `window.APP_CONFIG` access.

Provider nesting is wired in `src/App.tsx`:
`ThemeProviderWrapper` → `BroadcastChannelProvider` → `AppConfigProvider` → `QueryClientProvider` → `AppAlertProvider`.

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