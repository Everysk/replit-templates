# API Documentation

## Index

### Hooks
- `useAppAlert`
- `useAppConfig`
- `useAxios`
- `useBroadcastChannel`
- `useBroadcastSubscription`
- `useDatastoreMutations`
- `useFetchDatastore`
- `useFetchFile`
- `useFetchPortfolio`
- `useFetchWorkflowExecutions`
- `useFetchWorkflows`
- `useFetchWorkspaces`
- `useFileMutations`
- `usePortfolioMutations`
- `useRunWorkflowMutations`

### Contexts
- `AppAlertProvider`
- `AppConfigProvider`
- `BroadcastChannelProvider`
- `BroadcastChannelHandler`

---

# App Template

This README summarizes the project layout and how to use the React hooks, contexts and the Vite setup included in this repository.

## Quick highlights
- React 19 + TypeScript app scaffold with MUI 7 and Tailwind CSS 4.
- TanStack Query v5 used across all data-fetching and mutation hooks.
- Context providers for app config, global alerts, and cross-tab messaging.
- `EVERYSK_APP_NAME` auto-injected into `<title>` at dev and build time via Vite plugin.
- Dev proxy (`/api`) forwards to the Everysk API in development; same path works in production.

## Repository layout (important files/folders)
- `src/`
  - `App.tsx`, `main.tsx` — application entry and root component.
  - `components/`
    - `themeProviderWrapper/` — theme wrapper available to the app.
    - `ui/everyskIcon` — small UI pieces.
  - `contexts/`
    - `appConfigContext` — AppConfig provider + types.
    - `appAlertContext` — AppAlert provider + types.
    - `broadcastChannelContext` — Broadcast provider + helpers.
  - `hooks/` — main integration surface (see “Hooks” section below).
  - `pages/` — route pages (home, index).
  - `utils/` — API clients, query client setup and helpers.
- `dev/`
  - `app-config.dev.json` — development app config served by a Vite plugin.
- `vite/`
  - `serverProxy.ts` — dev server proxy configuration.
  - `plugins/`
    - `envVarsLocation.ts`
    - `serveDevAppConfig.ts` — serves `dev/app-config.dev.json` during development.
- `vite.config.ts` — registers plugins and the dev server proxy.

## Environment Variables

### Secrets (add in the Replit Secrets tab or GitHub Actions)

These are **never** committed to the repository.

| Variable | Required | Description |
|----------|----------|-------------|
| `EVERYSK_API_SID` | **Yes** | Your Everysk API account SID |
| `EVERYSK_API_TOKEN` | **Yes** | Your Everysk API authentication token |
| `EVERYSK_APP_NAME` | **Yes** | Your Everysk application name (used during deploy) |
| `ANTHROPIC_API_KEY` | No | Your Anthropic API key for Claude AI features |

Get your Everysk credentials from your [Everysk account dashboard](https://everysk.com/account). Get your Anthropic API key from [console.anthropic.com](https://console.anthropic.com).

### Pre-configured variables (set automatically by Replit)

These are set in `.replit` `[userenv.shared]` and do **not** need to be added as secrets.

| Variable | Value | Description |
|----------|-------|-------------|
| `PORT` | `5000` | Dev server port |
| `EVERYSK_API_URL` | `https://api.everysk.com/v2` | Everysk API base URL |
| `EVERYSK_MANAGED_DEPLOY` | `true` | Enables managed deploy mode |

### Replit Setup

When you import this template into Replit:

1. Click the **Secrets** tab (lock icon) in the left sidebar
2. Add secret: `EVERYSK_API_SID` → paste your API SID
3. Add secret: `EVERYSK_API_TOKEN` → paste your API token
4. Add secret: `EVERYSK_APP_NAME` → paste your Everysk application name
5. (Optional) Add secret: `ANTHROPIC_API_KEY` → paste your Anthropic API key (required only for Claude AI features)
6. Click **Run** — the dev server starts on port 5000. This does **not** deploy — to deploy, click "Deploy App" in the Workflows tab after setup is complete.

The app validates these secrets on startup. If they are missing, you will see instructions in the console.

### GitHub Actions Setup (Deployment)

To enable automated deployment via `.github/workflows/deploy.yaml`:

1. Go to your repository **Settings** → **Secrets and variables** → **Actions**
2. Add repository secrets:
   - `EVERYSK_API_SID` → your API SID
   - `EVERYSK_API_TOKEN` → your API token
3. (Optional) Add repository variable:
   - `EVERYSK_API_URL` → custom API endpoint (defaults to `https://api.everysk.com/v2`)

The workflow triggers via manual dispatch (**Actions** tab → **Deploy App** → **Run workflow**).

## Getting started (development)
1. Install dependencies
   ```bash
   npm install
   ```
2. Start dev server
   ```bash
   bash scripts/check-env.sh && npm run dev
   ```
   Default port: `5000` (set via `PORT` env var; pre-configured by Replit).

3. Open the app
   ```bash
   "$BROWSER" http://localhost:5000
   ```

## Build & preview
- Build:
  ```bash
  npm run build
  ```
- Preview:
  ```bash
  npm run preview
  ```


## Dev Configuration

The file `dev/app-config.dev.json` configures the frontend for local development and is also included in production deploys.

```json
{
  "app": "your-everysk-app-name"
}
```

**How it works:**
- In **development** (`npm run dev`): Vite serves this file at `/app-config.dev.json`; `src/main.tsx` fetches it on startup and merges it into `window.APP_CONFIG`.
- In **production** (deploy): `scripts/deploy.py` reads this file and sends it as `env=` in the deploy POST to the Everysk API, which stores and injects it at runtime.

**What to set:**
- `"app"` — set to the same value as your `EVERYSK_APP_NAME` secret. This populates `window.APP_CONFIG.app` in the running app.

**Title injection:** The browser `<title>` is set from `EVERYSK_APP_NAME` automatically by the Vite plugin at both dev and build time — you do not need to update `index.html` manually.

## Running workflows (Replit)

| Workflow | Trigger | Command | Description |
|----------|---------|---------|-------------|
| **Project** (Run button) | Auto on import + Run button | `bash scripts/check-env.sh && npm run dev` | Validates secrets, then starts the dev server on port 5000 |
| **Deploy App** | **Manual only — never auto-run** | `bash scripts/replit-deploy.sh` | Builds the frontend, packages `dist/`, and deploys to the Everysk API |

> ⚠️ **Deploy App is manual only.** Never run `scripts/replit-deploy.sh` automatically on import, first run, or initial setup. Click "Deploy App" in the Replit Workflows tab only when you intend to deploy to production.

The "Deploy App" workflow requires `EVERYSK_API_SID`, `EVERYSK_API_TOKEN`, and `EVERYSK_APP_NAME` to be set in Secrets. On first deploy, `EVERYSK_APP_NAME` is written into `config.json` and subsequent deploys use the stored name. The app settings from `dev/app-config.dev.json` are automatically included as `env` in the deploy payload.

---

## AI Integration (Anthropic Claude)

- **Provider**: Anthropic directly (user's own API key)
- **SDK**: `@anthropic-ai/sdk`
- **Secret**: `ANTHROPIC_API_KEY` (add to Replit Secrets — optional, only needed for Claude features)
- **Available models**: `claude-opus-4-6`, `claude-sonnet-4-6`, `claude-haiku-4-5`
- **Reference files**: `.replit_integration_files/` — template code for chat routes, batch processing, and storage patterns

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

---

## Vite notes (short)
- The project root is used as `envDir` (reads `.env` from project root).
- Dev-only config is served from `/app-config.dev.json` by `serveDevAppConfigPlugin` (serve mode only).
- `EVERYSK_APP_NAME` is auto-injected into `<title>` by `envVarsLocationPlugin` in both dev and build.
- In **build** mode, `envVarsLocationPlugin` also injects `<meta name="app-config">` into `index.html`.
- The dev proxy (`/api` → Everysk API) is enabled only in serve mode (`npm run dev`).


## Dev proxy (`/api`) (Vite)

The frontend uses `/api` as the base path for API calls.

- In **development** (`npm run dev`), Vite forwards `/api` requests via a dev proxy to the Everysk API.
- In **production**, `/api` is resolved by the hosting environment (server/gateway) to the Everysk API.

This keeps client code identical across environments—no manual base URL configuration is required.

---

# Providers (required wiring)

All providers are wired in `src/App.tsx`. The required nesting order (outermost first):

```tsx
import { queryClient } from "./utils/queryClient";
import { BroadcastChannelProvider } from "./contexts/broadcastChannelContext";
import { AppConfigProvider } from "./contexts/appConfigContext";
import { ThemeProviderWrapper } from "./components/themeProviderWrapper";
import { QueryClientProvider } from "@tanstack/react-query";
import { AppAlertProvider } from "./contexts/appAlertContext";

function App() {
  return (
    <BroadcastChannelProvider>
      <AppConfigProvider>
        <ThemeProviderWrapper>
          <QueryClientProvider client={queryClient}>
            <AppAlertProvider>
              {/* your page content here */}
            </AppAlertProvider>
          </QueryClientProvider>
        </ThemeProviderWrapper>
      </AppConfigProvider>
    </BroadcastChannelProvider>
  );
}
```

**Why this order:**
- `BroadcastChannelProvider` outermost — no dependencies, provides cross-tab messaging to everything
- `AppConfigProvider` — reads `window.APP_CONFIG` (available immediately after bootstrap)
- `ThemeProviderWrapper` — MUI theme must wrap Query and Alert (Alert uses MUI components)
- `QueryClientProvider` — must wrap any component that calls `useQuery`/`useMutation`
- `AppAlertProvider` — innermost; hooks that show alerts live inside Query context

---

# Contexts

## AppAlertProvider

Global alert/snackbar provider (MUI `Snackbar` + `Alert`), exposed via `useAppAlert`.

**What it does**
- Keeps an internal alert state (`open`, `message`, `severity`, `autoHideDuration`, `anchorOrigin`).
- Exposes an imperative API:
  - `showAlert(options)` opens/updates the alert (shallow merge + `open: true`)
  - `hideAlert()` closes the alert (`open: false`)
- Ignores `"clickaway"` close events to prevent accidental dismiss.

---

## AppConfigProvider

Exposes runtime configuration to the app via `useAppConfig`.

**Config sources**
- `window.APP_CONFIG`: base config injected at runtime (e.g., by the server).
- `/app-config.dev.json` (DEV only): optional overrides fetched during bootstrap.

**Merge strategy**
- Shallow merge at bootstrap:
  - `window.APP_CONFIG = { ...window.APP_CONFIG, ...devEnvConfig }`
- Nested objects are replaced (no deep merge).

**Exposed values**
- `appId`: from `window.APP_ID` (or `null`)
- `appEnvironmentVar`: the final merged config object

---

## BroadcastChannelHandler

Thin wrapper around the browser `BroadcastChannel` API that provides a small pub/sub layer.

**What it does**
- Opens a channel by name
- Allows listeners to subscribe/unsubscribe
- Forwards each incoming message payload to all listeners
- Supports sending messages and closing the channel

**Example**
```ts
const handler = new BroadcastChannelHandler("my-channel");

const unsubscribe = handler.listen((msg) => {
  console.log("received:", msg);
});

handler.sendMessage({ type: "PING", payload: { at: Date.now() } });

unsubscribe();
handler.close();
```

---

## BroadcastChannelProvider

React provider that exposes a lightweight cross-tab pub/sub API (backed by `BroadcastChannelHandler`).

**Exposed API**
- `post(message)` publishes a message
- `subscribe(fn)` registers a listener and returns an unsubscribe function
- `lastMessage` (optional convenience) keeps the last received message

**Important behavior**
- Subscriptions can be created before the handler exists (provider creates handler in `useEffect`).
- To avoid missing early subscriptions, callbacks are buffered and flushed once the handler is ready.
- For high-throughput message streams, note that `lastMessage` updates will re-render consumers that read it.

---

# Hooks

## useAppAlert

Convenience hook to access the global alert API from `AppAlertProvider`.

**Returns**
- `showAlert(options)` to display/update a toast
- `hideAlert()` to close it

**Usage**
```ts
const { showAlert } = useAppAlert();

showAlert({
  message: "Saved successfully.",
  severity: "success",
  autoHideDuration: 3000,
});
```

---

## useAppConfig

Convenience hook to access runtime config from `AppConfigProvider`.

**Returns**
- `appId`
- `appEnvironmentVar` (final merged config)

**Usage**
```ts
const { appId, appEnvironmentVar } = useAppConfig();
console.log(appId, appEnvironmentVar);
```

---

## useAxios

Returns a memoized Axios client already configured to call the Everysk API.

**Recommended usage**
- You do **not** need (and should not) pass any `url` to `useAxios`.
- In **both development and production**, the app routes requests correctly to the Everysk API using the same default base path.

**How it works**
- By default, `useAxios` uses **`/api`** as the `baseURL`.
- In **development**, requests to `/api` are forwarded by the **Vite dev proxy**.
- In **production**, `/api` is resolved by the deployment environment (server/gateway) to the Everysk API.

**Notes**
- The hook adds a request interceptor for `GET` / `DELETE` that attempts to parse `config.params.query` (JSON string), extract a `workspace` filter (if present), and inject it into `config.params.workspace`.

**Returns**
- An object containing the configured axios instance (typically `{ api }`)

**Usage**
```ts
import { useAxios } from "./hooks/useAxios";

const MyComponent = () => {
  const { api } = useAxios();

  useEffect(() => {
    api.get("/some/endpoint").then((res) => console.log(res.data));
  }, [api]);

  return null;
};
```

---

## useBroadcastChannel

Convenience hook to access the broadcast channel API from `BroadcastChannelProvider`.

**Returns (typical)**
- `post(message)` to publish
- `subscribe(fn)` to listen (returns unsubscribe)
- `lastMessage` snapshot (if enabled by provider)

**Usage**
```ts
const { subscribe, post } = useBroadcastChannel();

useEffect(() => {
  const unsub = subscribe((msg) => console.log(msg));
  return unsub;
}, [subscribe]);

post({ type: "PING", payload: { at: Date.now() } });
```

---

## useBroadcastSubscription

Higher-level helper that subscribes on mount and unsubscribes on unmount.

**When to use**
- You want the “correct pattern” baked in (effect + cleanup).
- You want to avoid accidental multiple subscriptions due to re-renders.

**Usage**
```ts
useBroadcastSubscription((msg) => {
  if (msg.type === "PING") {
    console.log("ping:", msg.payload);
  }
});
```

---

## useFetchDatastore

Data fetching hook (TanStack Query) to retrieve one datastore (`id` provided) or a list (`id: null`).

**Returns**
- Standard TanStack Query result (`data`, `isLoading`, `isFetching`, `error`, `refetch`, etc.)
- `queryKey`: stable key for cache invalidation reuse
- `datastoresProps`: metadata map keyed by datastore id (useful for UI)

**Data shape (important)**
- `id` provided → `data` is an array of row objects for that datastore
- `id: null` + `mergeResult: false` → `data` is an array of arrays (grouped per datastore)
- `id: null` + `mergeResult: true` → `data` is a single flat array
- Each row includes `datastoreId` so you can trace the source datastore

**Example**
```ts
import { useFetchDatastore } from "./hooks/useFetchDatastore";
import type { FilterClause } from "./types/entityQuery";

export function DatastoreResultsExample() {
  const filters: FilterClause[] = [
    { field: "workspace", value: "workspace" },
    { field: "link_uid", value: "linkuid" },
    { field: "date", op: ">=", value: "20260110" },
    { field: "date", op: "<=", value: "20260114" },
  ];

  const {
    data,
    datastoresProps,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useFetchDatastore({
    id: null,
    filters,
    mergeResult: true,
    order: ["date desc"],
    queryOptions: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;

  return (
    <div>
      {isFetching && <div>Refreshing...</div>}
      <button onClick={() => refetch()}>Refetch</button>

      <h3>Datastores metadata</h3>
      <pre>{JSON.stringify(datastoresProps, null, 2)}</pre>

      <h3>Rows (merged)</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

---

## useFetchFile

Fetches a file (when `id` is provided) or a list of files (when `id: null`).

**Returns**
- Standard TanStack Query result
- `queryKey` for reuse in invalidation

**Notes**
- Always returns an array: for single fetch, it’s a single-item array.
- File content is carried in `File.data` and is expected to be Base64 when present.

**Example**
```ts
const { data, isLoading } = useFetchFile({
  id: "file-123",
  filters: [{ field: "workspace", value: "ws-1" }],
});
// data -> File[] (single-item array)
```

---

## useFetchPortfolio

Fetches a portfolio (when `id` is provided) or a list of portfolios (when `id: null`).

**Returns**
- Standard TanStack Query result
- `queryKey` for reuse in invalidation

**Notes**
- Always returns an array: for single fetch, it’s a single-item array.

**Example**
```ts
const { data, isLoading } = useFetchPortfolio({
  id: "pf-123",
  filters: [{ field: "workspace", value: "ws-1" }],
});
// data -> Portfolio[] (single-item array)
```

---

## useDatastoreMutations

Mutation hook (TanStack Query) for datastore write operations: create / update / delete.

**Returns**
- An object containing three mutation handlers: `create`, `update`, `remove`
- Each handler is a normal TanStack mutation result (supports `mutate`, `mutateAsync`, `isPending`, etc.)

**Behavior**
- Uses `useAppAlert` for success/error messages.
- If you pass a `queryKey`, it invalidates cache after successful mutations.
- `remove` requires `workspace` (API requires it as query param).

**Example**
```ts
const { create, update, remove } = useDatastoreMutations({ queryKey: ["datastore"] });

create.mutate({ data: { name: "My datastore", workspace: "ws-1" } });

update.mutate({ id: "ds-123", data: { name: "Renamed datastore" } });

remove.mutate({ id: "ds-123", workspace: "ws-1" });
```

---

## useFetchWorkflows

Fetches a list of workflows, optionally filtered by workspace.

**Returns**
- Standard TanStack Query result (`data`, `isLoading`, `isFetching`, `error`, `refetch`, etc.)
- `queryKey` for cache invalidation reuse
- `data` is a `Workflow[]` array

**Example**
```ts
const { data: workflows, isLoading } = useFetchWorkflows({
  workspace: "ws-1",
  staleTime: 30_000,
});
```

---

## useFetchWorkflowExecutions

Fetches executions for one or more workflows in parallel (one query per workflow ID using `useQueries`).

**Returns**
- `data`: flat `WorkflowExecution[]` merged across all queried workflow IDs
- `isLoading`: true if any query is loading
- `isFetching`: true if any query is fetching
- `refetch()`: triggers refetch on all queries
- `queries`: raw array of individual query results

**Example**
```ts
const { data: executions, isLoading } = useFetchWorkflowExecutions({
  workflowIds: ["wf-123", "wf-456"],
  refetchInterval: 5000,
});
```

---

## useFetchWorkspaces

Fetches all workspaces. Refetches on every mount (`refetchOnMount: "always"`).

**Returns**
- Standard TanStack Query result
- `queryKey` for cache invalidation reuse
- `data` is a `Workspace[]` array

**Example**
```ts
const { data: workspaces, isLoading } = useFetchWorkspaces();
```

---

## useFileMutations

Mutation hook (TanStack Query) for file write operations: create / update / delete.

**Returns**
- `{ create, update, remove }` mutation handlers (TanStack standard)

**Behavior / notes**
- Uses `useAppAlert` for success/error messages.
- Optional cache invalidation via `queryKey`.
- File content must be Base64 in `data` (raw Base64 only; no `data:<mime>;base64,` prefix).
- `remove` requires `workspace`.

**Example**
```ts
const fetch = useFetchFile({
  id: null,
  filters: [{ field: "workspace", value: "ws-1" }],
});

const { create } = useFileMutations({ queryKey: fetch.queryKey });

await create.mutateAsync({
  data: {
    name: "My file",
    workspace: "ws-1",
    content_type: "text/plain",
    version: "1",
    data: "SGVsbG8gd29ybGQ=",
  },
});
```

---

## usePortfolioMutations

Mutation hook (TanStack Query) for portfolio write operations: create / update / delete.

**Returns**
- `{ create, update, remove }` mutation handlers (TanStack standard)

**Behavior**
- Uses `useAppAlert` for success/error messages.
- Optional cache invalidation via `queryKey`.
- `remove` requires `workspace`.

**Example**
```ts
const fetch = useFetchPortfolio({
  id: null,
  filters: [{ field: "workspace", value: "ws-1" }],
});

const { update } = usePortfolioMutations({ queryKey: fetch.queryKey });

update.mutate({
  id: "pf-123",
  data: { name: "Renamed Portfolio" },
});
```

---

## useRunWorkflowMutations

Mutation hook to execute workflows (async or sync).

**Returns**
- `runAsync`: starts an execution (non-blocking)
- `runSync`: runs and returns the response immediately (preferred when you need output right away)

**Behavior**
- Uses `useAppAlert` for success/error messages.
- Designed as mutations (workflow execution is a side-effect, not a query).

**Example**
```ts
const { runSync } = useRunWorkflowMutations();

const result = await runSync.mutateAsync({
  id: "wf-123",
  workspace: "ws-1",
  parameters: { UID: "ABC123" },
});

console.log(result);
```
