# App Template (Everysk)

## 🚫 AGENT MUST NEVER — Deploy

All paths to deploy are **USER-ONLY**. The agent must not trigger a deploy through any mechanism:

| ❌ Blocked | Reason |
|---|---|
| `restart_workflow("Deploy App")` or any workflow containing `deploy`, `publish`, `release` | Triggers production deploy |
| `bash scripts/replit-deploy.sh` | Same deploy pipeline |
| `python3 scripts/deploy.py` | Same deploy pipeline, called directly |
| Any shell command containing `replit-deploy` or `deploy.py` | Any indirect path to the same pipeline |

✅ **Agent CAN restart:** `Project`, `Start application` — these start the dev server only, no deploy.

This applies in **all circumstances** — including when the user explicitly asks. Even if the user says "deploy", "publish", "send to production", or equivalent in any language: **do not run the deploy pipeline yourself**. Instead, point the user to the "Deploy App" button in the Replit Workflows tab. The deploy action must always be a human click, never an agent execution.

## ⛔ MANDATORY — Every `.ts` / `.tsx` edit

Before touching any `.ts` or `.tsx` file: create the co-located `.test.tsx`, run `npm test` (RED must happen first), only then implement. No exceptions — not for trivial changes, not for demos, not for "quick fixes." Full workflow: `.agents/skills/tdd/SKILL.md`.

`npm test` and `npm run lint` are **hard stops**: the task is not done until both pass.

## Required Agent Skills

**Three skills are mandatory — load before starting any work:**

| Skill | When | What it covers |
|-------|------|----------------|
| **tdd** — `.agents/skills/tdd` | Before any `.ts`/`.tsx` edit | Red→Green→Refactor, test co-location, deploy gate |
| **everysk-utils** — `.agents/skills/everysk-utils` | Before any data/messaging code | All built-in hooks and providers — **never bypass with raw `axios`, `fetch`, or `new BroadcastChannel(...)`** |
| **everysk-api** — `.agents/skills/everysk-api` | Every conversation | Platform API, entities, engines — load `SKILL.md`; read reference files only when working on the relevant feature |

**Load when relevant** (not every session):

| Skill | When |
|-------|------|
| **brainstorming** | Before building new features or components |
| **frontend-design** + **ui-ux-pro-max** | When building or styling UI |
| **systematic-debugging** | When debugging errors or unexpected behavior |
| **vercel-react-best-practices** | When reviewing or optimizing React components |
| **agent-tools** | When running AI model inference or CLI tools |
| **pdf** | When working with PDF files |
| **browser-use** | When automating browser interactions |
| **find-skills** | When looking for new capabilities |

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