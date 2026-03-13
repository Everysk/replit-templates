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
- `src/utils/api/workflowList.ts` — API utility functions for listing workflows and workflow executions
- `src/types/workflow.ts` — TypeScript types for Workflow and WorkflowExecution entities

---

### Hooks Reference

#### Utility Hooks

**`useAxios(url?: string | null)`** — `src/hooks/useAxios.tsx`
- Returns `{ api }`: memoized Axios instance with `baseURL=/api`.
- Request interceptor for GET/DELETE: extracts `workspace` from `params.query` (JSON string) and injects it as `params.workspace`.
- Use `/api` — no custom URL needed. In dev, Vite proxies it; in prod, the gateway resolves it.
```ts
const { api } = useAxios();
api.get("/portfolios").then(res => console.log(res.data));
```

**`useAppAlert()`** — `src/hooks/useAppAlert.tsx`
- Returns `{ showAlert(options), hideAlert() }` from `AppAlertContext`.
- Throws if used outside `<AppAlertProvider>`.
```ts
const { showAlert } = useAppAlert();
showAlert({ message: "Saved.", severity: "success", autoHideDuration: 3000 });
```

**`useAppConfig()`** — `src/hooks/useAppConfig.tsx`
- Returns `{ appId, appEnvironmentVar }` from `AppConfigContext`.
- Throws if used outside `<AppConfigProvider>`.
```ts
const { appId, appEnvironmentVar } = useAppConfig();
```

**`useBroadcastChannel()`** — `src/hooks/useBroadcastChannel.tsx`
- Returns `{ post(message), subscribe(fn), lastMessage }` from `BroadcastChannelContext`.
- Throws if used outside `<BroadcastChannelProvider>`.
```ts
const { subscribe, post } = useBroadcastChannel();
useEffect(() => {
  const unsub = subscribe((msg) => console.log(msg));
  return unsub;
}, [subscribe]);
post({ type: "PING", payload: { at: Date.now() } });
```

**`useBroadcastSubscription(handler)`** — `src/hooks/useBroadcastSubscription.tsx`
- Higher-level: subscribes on mount, unsubscribes on unmount. Uses a ref-backed handler to avoid re-subscriptions on re-renders.
```ts
useBroadcastSubscription((msg) => {
  if (msg.type === "PING") console.log("ping:", msg.payload);
});
```

---

#### Portfolio Hooks

**`useFetchPortfolio({ id, workspace, queryOptions? })`** — `src/hooks/portfolio/useFetchPortfolio.tsx`
- Fetches a single `Portfolio` by ID. Uses `useQuery`. Default options: `refetchOnMount: "always"`, `staleTime: 0`, `gcTime: 0`.
- Returns `{ ...query, queryKey }`. Pass `queryKey` to `usePortfolioMutations` for cache invalidation.
```ts
const { data, isLoading, queryKey } = useFetchPortfolio({ id: "pf-123", workspace: "ws-1" });
// data -> Portfolio
```

**`useFetchPortfolios({ filters?, order?, projection?, pageSize?, queryOptions? })`** — `src/hooks/portfolio/useFetchPortfolios.tsx`
- Infinite/paginated list of portfolios. Uses `useInfiniteQuery`. Flattens all pages into a flat `Portfolio[]` via `select`.
- Returns `{ query, queryKey }`. `query.data` is `Portfolio[]`.
```ts
const { query } = useFetchPortfolios({
  filters: [{ field: "workspace", value: "ws-1" }],
  pageSize: 20,
});
const portfolios = query.data ?? [];
```

**`usePortfolioMutations({ queryKey? })`** — `src/hooks/portfolio/usePortfolioMutations.tsx`
- Returns `{ create, update, remove }` TanStack mutation results.
- Shows success/error alerts via `useAppAlert`. Invalidates `queryKey` on success if provided.
- `remove` requires `{ id, workspace }`.
```ts
const { create, update, remove } = usePortfolioMutations({ queryKey });
create.mutate({ data: { name: "My Portfolio", base_currency: "USD", date: "2026-01-08", workspace: "ws-1", securities: [] } });
update.mutate({ id: "pf-123", data: { name: "Renamed" } });
remove.mutate({ id: "pf-123", workspace: "ws-1" });
```

---

#### Datastore Hooks

**`useFetchDatastore({ id, workspace, queryOptions? })`** — `src/hooks/datastore/useFetchDatastore.tsx`
- Fetches a single datastore by ID. Returns `DatastoreWithRows`: full `Datastore` shape with `data` as `DefaultObject[]` (rows transformed via `datastoreToObject`).
- Returns `{ ...query, queryKey }`.
```ts
const { data, isLoading, queryKey } = useFetchDatastore({ id: "ds-123", workspace: "ws-1" });
// data -> DatastoreWithRows
// data.data -> [{ datastoreId: "ds-123", col1: "value", ... }]
```

**`useFetchInfiniteDatastore({ filters?, order?, projection?, pageSize?, queryOptions? })`** — `src/hooks/datastore/useFetchDatastores.tsx`
- Infinite/paginated list of datastores with cursor-based pagination. `query.data` is a flat `DatastoreWithRows[]`.
- Returns `{ query, queryKey }`.
```ts
const { query } = useFetchInfiniteDatastore({
  filters: [{ field: "workspace", value: "ws-1" }],
  pageSize: 20,
});
const datastores = query.data ?? [];
```

**`useDatastoreMutations({ queryKey? })`** — `src/hooks/datastore/useDatastoreMutations.tsx`
- Returns `{ create, update, remove }`. Shows alerts. Invalidates `queryKey` on success.
- `remove` requires `{ id, workspace }`.
- `create`/`update` accept `data.data` as `[["col1", "col2"], ["val1", "val2"], ...]` (header row + data rows).
```ts
const { create, update, remove } = useDatastoreMutations({ queryKey });
create.mutate({ data: { name: "My DS", workspace: "ws-1", data: [["id", "name"], ["001", "Alice"]] } });
update.mutate({ id: "ds-123", data: { name: "Renamed", data: [["id", "name"], ["001", "Alice"]] } });
remove.mutate({ id: "ds-123", workspace: "ws-1" });
```

---

#### File Hooks

**`useFetchFile({ id, workspace, queryOptions? })`** — `src/hooks/file/useFetchFile.tsx`
- Fetches a single `File` by ID. `File.data` is Base64-encoded content when present.
- Returns `{ ...query, queryKey }`.
```ts
const { data, isLoading, queryKey } = useFetchFile({ id: "file-123", workspace: "ws-1" });
// data -> File (data.data is Base64 string)
```

**`useFetchInfiniteFile({ filters?, order?, projection?, pageSize?, queryOptions? })`** — `src/hooks/file/useFetchFiles.tsx`
- Infinite/paginated list of files. `query.data` is a flat `File[]`.
- Returns `{ query, queryKey }`.
```ts
const { query } = useFetchInfiniteFile({
  filters: [{ field: "workspace", value: "ws-1" }],
  pageSize: 20,
});
const files = query.data ?? [];
```

**`useFileMutations({ queryKey? })`** — `src/hooks/file/useFileMutations.tsx`
- Returns `{ create, update, remove }`. Shows alerts. Invalidates `queryKey` on success.
- File content must be raw Base64 (no `data:<mime>;base64,` prefix). `remove` requires `{ id, workspace }`.
```ts
const { create } = useFileMutations({ queryKey });
await create.mutateAsync({
  data: { name: "report.txt", workspace: "ws-1", content_type: "text/plain", version: "1", link_uid: null, data: "SGVsbG8=" }
});
```

---

#### Workflow Hooks

**`useFetchWorkflow({ id, workspace, queryOptions? })`** — `src/hooks/workflow/useFetchWorkflow.tsx`
- Fetches a single `Workflow` by ID. Returns `{ ...query, queryKey }`.
```ts
const { data } = useFetchWorkflow({ id: "wf-123", workspace: "ws-1" });
// data -> Workflow
```

**`useFetchWorkflows({ filters?, order?, projection?, pageSize?, queryOptions? })`** — `src/hooks/workflow/useFetchWorkflows.tsx`
- Infinite/paginated list of workflows. `query.data` is a flat `Workflow[]`.
- Returns `{ query, queryKey }`.
```ts
const { query } = useFetchWorkflows({
  filters: [{ field: "workspace", value: "ws-1" }],
  pageSize: 20,
});
const workflows = query.data ?? [];
```

**`useWorkflowRunMutations()`** — `src/hooks/workflow/useRunWorkflowMutations.tsx`
- Returns `{ runAsync, runSync }`. Both accept `{ id, workspace, parameters }`.
- `runSync` returns the execution result immediately (preferred when output is needed).
- `runAsync` starts execution without waiting for result.
```ts
const { runSync, runAsync } = useWorkflowRunMutations();
const result = await runSync.mutateAsync({ id: "wf-123", workspace: "ws-1", parameters: { UID: "ABC" } });
runAsync.mutate({ id: "wf-123", workspace: "ws-1", parameters: {} });
```

---

#### Workspace & Execution Hooks

**`useFetchWorkspaces()`** — `src/hooks/useFetchWorkspaces.tsx`
- Fetches all workspaces. `staleTime: 60000`, `refetchOnMount: "always"`.
- Returns `{ data: Workspace[], isLoading, queryKey, ... }`.
```ts
const { data: workspaces, isLoading } = useFetchWorkspaces();
```

**`useFetchWorkflowExecutions({ workflowIds, enabled?, refetchInterval?, staleTime? })`** — `src/hooks/useFetchWorkflowExecutions.tsx`
- Fetches executions for multiple workflow IDs in parallel using `useQueries`. Merges all results into a flat `WorkflowExecution[]`.
- Returns `{ data: WorkflowExecution[], isLoading, isFetching, refetch, queries }`.
```ts
const { data: executions, isLoading } = useFetchWorkflowExecutions({
  workflowIds: ["wf-123", "wf-456"],
  refetchInterval: 5000,
});
```

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
