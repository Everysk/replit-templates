# API Documentation

## Index

### Hooks
- `useAppAlert`
- `useAppConfig`
- `useAxios`
- `useBroadcastChannel`
- `useBroadcastSubscription`
- `useFetchDatastore`
- `useFetchDatastores`
- `useDatastoreMutations`
- `useFetchPortfolio`
- `useFetchPortfolios`
- `usePortfolioMutations`
- `useFetchFile`
- `useFetchFiles`
- `useFileMutations`
- `useFetchWorkflow`
- `useFetchWorkflows`
- `useWorkflowRunMutations`
- `useFetchWorkflowExecution`
- `useFetchWorkflowExecutions`
- `useFetchWorkerExecution`
- `useFetchWorkerExecutions`
- `useFetchWorkspace`
- `useFetchWorkspaces`

### Contexts
- `AppAlertProvider`
- `AppConfigProvider`
- `BroadcastChannelProvider`
- `BroadcastChannelHandler`
- `AgGridLicenseProvider` *(optional — requires `ag-grid-enterprise`)*

---

# App Template

This README summarizes the project layout and how to use the React hooks, contexts and the Vite setup included in this repository.

> **New to Everysk + Replit?** Read the setup guide first: [Using Replit with Everysk](https://docs.google.com/document/d/1DJrgKWCkoXnQLx8ZgZQi4T_EIy8jBXt1WECEwHfU7ZU/edit?usp=sharing)

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
import { ThemeProviderWrapper } from "./components/themeProviderWrapper";
import { BroadcastChannelProvider } from "./contexts/broadcastChannelContext";
import { AppConfigProvider } from "./contexts/appConfigContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { AppAlertProvider } from "./contexts/appAlertContext";

function App() {
  return (
    <ThemeProviderWrapper>
      <BroadcastChannelProvider>
        <AppConfigProvider>
          <QueryClientProvider client={queryClient}>
            <AppAlertProvider>
              {/* your page content here */}
            </AppAlertProvider>
          </QueryClientProvider>
        </AppConfigProvider>
      </BroadcastChannelProvider>
    </ThemeProviderWrapper>
  );
}
```

**Why this order:**
- `ThemeProviderWrapper` outermost — MUI theme must wrap everything; all MUI components (including Alert) depend on it
- `BroadcastChannelProvider` — no dependencies, provides cross-tab messaging to everything below
- `AppConfigProvider` — reads `window.APP_CONFIG` (available immediately after bootstrap)
- `QueryClientProvider` — must wrap any component that calls `useQuery`/`useMutation`
- `AppAlertProvider` — innermost; hooks that show alerts live inside Query context

---

# Contexts

## AgGridLicenseProvider

> **Optional provider** — requires `ag-grid-enterprise`. Run `npm install ag-grid-enterprise` before using it.

Manages the AG Grid Enterprise license for the app. Must wrap any component that renders an AG Grid Enterprise table.

**What it does**
- Listens for a `SEND_AG_GRID_LICENSE` broadcast message from the parent frame (Everysk shell).
- Sets the license key via `LicenseManager.setLicenseKey()` when the message is received.
- In **production**, renders a loading screen (`GlobalLoading`) until the license arrives.
- In **development** (`import.meta.env.DEV`), skips the license wait and renders children immediately.
- If `ag-grid-enterprise` is not installed, degrades gracefully: children render normally without license enforcement.

**Required package**
```bash
npm install ag-grid-enterprise
```

**Wiring**
Place `AgGridLicenseProvider` inside `BroadcastChannelProvider` (it depends on the broadcast channel) and wrap only the subtree that uses AG Grid Enterprise components:

```tsx
import { AgGridLicenseProvider } from "./contexts/agGridLicenseContext/agGridLicenseProvider";

function App() {
  return (
    <BroadcastChannelProvider>
      <AppConfigProvider>
        <ThemeProviderWrapper>
          <QueryClientProvider client={queryClient}>
            <AppAlertProvider>
              <AgGridLicenseProvider>
                {/* components that use AG Grid Enterprise */}
              </AgGridLicenseProvider>
            </AppAlertProvider>
          </QueryClientProvider>
        </ThemeProviderWrapper>
      </AppConfigProvider>
    </BroadcastChannelProvider>
  );
}
```

**Broadcast messages**
| Type | Direction | Payload | Description |
|------|-----------|---------|-------------|
| `REQUEST_AG_GRID_LICENSE` | app → shell | — | Sent on mount to request the license key |
| `SEND_AG_GRID_LICENSE` | shell → app | `{ license: string }` | Shell responds with the license key |

---

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
  message: “Saved successfully.”,
  severity: “success”,
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
import { useAxios } from “./hooks/useAxios”;

const MyComponent = () => {
  const { api } = useAxios();

  useEffect(() => {
    api.get(“/some/endpoint”).then((res) => console.log(res.data));
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

post({ type: “PING”, payload: { at: Date.now() } });
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
  if (msg.type === “PING”) {
    console.log(“ping:”, msg.payload);
  }
});
```

---

## useFetchDatastore

Fetches a single datastore by ID (TanStack Query `useQuery`). Alerts on error via `useAppAlert`.

**Parameters**
- `id` — datastore identifier (required)
- `workspace` — workspace name (required)
- `queryOptions` — TanStack Query options (optional; defaults: `refetchOnMount: “always”`, `staleTime: 0`, `gcTime: 0`)

**Returns**
- All standard TanStack Query fields (`data`, `isLoading`, `isFetching`, `error`, `refetch`, etc.)
- `queryKey` — stable cache key, pass to `useDatastoreMutations` for automatic invalidation
- `data` is a `DatastoreWithRows` object: full `Datastore` shape with `data` replaced by `DefaultObject[]` (rows transformed via `datastoreToObject`)

**Example**
```ts
const { data, isLoading, queryKey } = useFetchDatastore({
  id: “ds-123”,
  workspace: “ws-1”,
});
// data -> DatastoreWithRows
// data.data -> [{ datastoreId: “ds-123”, col1: “value”, ... }]
```

---

## useFetchDatastores

Fetches a paginated list of datastores (TanStack Query `useInfiniteQuery`) with cursor-based pagination. Automatically flattens all pages into a single `DatastoreWithRows[]` via `select`.

**Parameters**
- `filters` — filter clauses (optional; must include a `workspace` filter)
- `order` — sort clauses (optional)
- `projection` — fields to include (optional)
- `pageSize` — items per page (optional, default `10`)
- `queryOptions` — TanStack infinite query options (optional)

**Returns**
- `query` — full `useInfiniteQuery` result; `query.data` is a flat `DatastoreWithRows[]`
- `queryKey` — stable cache key

**Example**
```ts
const { query, queryKey } = useFetchDatastores({
  filters: [{ field: “workspace”, value: “ws-1” }],
  pageSize: 20,
});

const datastores = query.data ?? [];
```

---

## useDatastoreMutations

Mutation hook (TanStack Query) for datastore write operations: create / update / delete. Shows success/error alerts via `useAppAlert`. Optionally invalidates a query cache key after each successful mutation.

**Parameters**
- `queryKey` — cache key to invalidate on success (optional; typically the `queryKey` from `useFetchDatastores`)

**Returns**
- `{ create, update, remove }` — TanStack `UseMutationResult` objects
- Each supports `mutate`, `mutateAsync`, `isPending`, `isSuccess`, `isError`, etc.

**Notes**
- `remove` requires `{ id, workspace }`.
- `create` / `update` accept `data.data` as a row matrix: `[[“col1”, “col2”], [“val1”, “val2”], ...]` (header row + data rows).

**Example**
```ts
const { create, update, remove } = useDatastoreMutations({ queryKey });

create.mutate({
  data: { name: “My datastore”, workspace: “ws-1”, data: [[“id”, “name”], [“001”, “Alice”]] },
});

update.mutate({
  id: “ds-123”,
  data: { name: “Renamed”, data: [[“id”, “name”], [“001”, “Alice”]] },
});

remove.mutate({ id: “ds-123”, workspace: “ws-1” });
```

---

## useFetchPortfolio

Fetches a single portfolio by ID (TanStack Query `useQuery`). Alerts on error via `useAppAlert`.

**Parameters**
- `id` — portfolio identifier (required)
- `workspace` — workspace name (required)
- `queryOptions` — TanStack Query options (optional; defaults: `refetchOnMount: “always”`, `staleTime: 0`, `gcTime: 0`)

**Returns**
- All standard TanStack Query fields
- `queryKey` — stable cache key, pass to `usePortfolioMutations` for automatic invalidation
- `data` is a single `Portfolio` object

**Example**
```ts
const { data, isLoading, queryKey } = useFetchPortfolio({
  id: “pf-123”,
  workspace: “ws-1”,
});
// data -> Portfolio
```

---

## useFetchPortfolios

Fetches a paginated list of portfolios (TanStack Query `useInfiniteQuery`) with cursor-based pagination. Automatically flattens all pages into a single `Portfolio[]` via `select`.

**Parameters**
- `filters` — filter clauses (optional; must include a `workspace` filter)
- `order` — sort clauses (optional)
- `projection` — fields to include (optional)
- `pageSize` — items per page (optional, default `10`)
- `queryOptions` — TanStack infinite query options (optional)

**Returns**
- `query` — full `useInfiniteQuery` result; `query.data` is a flat `Portfolio[]`
- `queryKey` — stable cache key

**Example**
```ts
const { query, queryKey } = useFetchPortfolios({
  filters: [{ field: “workspace”, value: “ws-1” }],
  pageSize: 20,
});

const portfolios = query.data ?? [];
```

---

## usePortfolioMutations

Mutation hook (TanStack Query) for portfolio write operations: create / update / delete. Shows success/error alerts via `useAppAlert`. Optionally invalidates a query cache key after each successful mutation.

**Parameters**
- `queryKey` — cache key to invalidate on success (optional; typically the `queryKey` from `useFetchPortfolios`)

**Returns**
- `{ create, update, remove }` — TanStack `UseMutationResult` objects

**Notes**
- `remove` requires `{ id, workspace }`.

**Example**
```ts
const { create, update, remove } = usePortfolioMutations({ queryKey });

create.mutate({
  data: { name: “My Portfolio”, base_currency: “USD”, date: “2026-01-08”, workspace: “ws-1”, securities: [] },
});

update.mutate({ id: “pf-123”, data: { name: “Renamed” } });

remove.mutate({ id: “pf-123”, workspace: “ws-1” });
```

---

## useFetchFile

Fetches a single file by ID (TanStack Query `useQuery`). Alerts on error via `useAppAlert`.

**Parameters**
- `id` — file identifier (required)
- `workspace` — workspace name (required)
- `queryOptions` — TanStack Query options (optional; defaults: `refetchOnMount: “always”`, `staleTime: 0`, `gcTime: 0`)

**Returns**
- All standard TanStack Query fields
- `queryKey` — stable cache key, pass to `useFileMutations` for automatic invalidation
- `data` is a single `File` object; `File.data` is Base64-encoded content when present

**Example**
```ts
const { data, isLoading, queryKey } = useFetchFile({
  id: “file-123”,
  workspace: “ws-1”,
});
// data -> File (data.data is Base64 string)
```

---

## useFetchFiles

Fetches a paginated list of files (TanStack Query `useInfiniteQuery`) with cursor-based pagination. Automatically flattens all pages into a single `File[]` via `select`.

**Parameters**
- `filters` — filter clauses (optional; must include a `workspace` filter)
- `order` — sort clauses (optional)
- `projection` — fields to include (optional)
- `pageSize` — items per page (optional, default `10`)
- `queryOptions` — TanStack infinite query options (optional)

**Returns**
- `query` — full `useInfiniteQuery` result; `query.data` is a flat `File[]`
- `queryKey` — stable cache key

**Example**
```ts
const { query, queryKey } = useFetchFiles({
  filters: [{ field: “workspace”, value: “ws-1” }],
  pageSize: 20,
});

const files = query.data ?? [];
```

---

## useFileMutations

Mutation hook (TanStack Query) for file write operations: create / update / delete. Shows success/error alerts via `useAppAlert`. Optionally invalidates a query cache key after each successful mutation.

**Parameters**
- `queryKey` — cache key to invalidate on success (optional; typically the `queryKey` from `useFetchFiles`)

**Returns**
- `{ create, update, remove }` — TanStack `UseMutationResult` objects

**Notes**
- File content (`data.data`) must be raw Base64 — no `data:<mime>;base64,` prefix.
- `remove` requires `{ id, workspace }`.

**Example**
```ts
const { create, update, remove } = useFileMutations({ queryKey });

create.mutate({
  data: {
    name: “report.txt”,
    workspace: “ws-1”,
    content_type: “text/plain”,
    version: “1”,
    link_uid: null,
    data: “SGVsbG8gd29ybGQ=”,
  },
});

update.mutate({ id: “file-123”, data: { name: “renamed.txt” } });

remove.mutate({ id: “file-123”, workspace: “ws-1” });
```

---

## useFetchWorkflow

Fetches a single workflow by ID (TanStack Query `useQuery`). Alerts on error via `useAppAlert`.

**Parameters**
- `id` — workflow identifier (required)
- `workspace` — workspace name (required)
- `queryOptions` — TanStack Query options (optional; defaults: `refetchOnMount: “always”`, `staleTime: 0`, `gcTime: 0`)

**Returns**
- All standard TanStack Query fields
- `queryKey` — stable cache key
- `data` is a single `Workflow` object

**Example**
```ts
const { data, isLoading } = useFetchWorkflow({ id: “wf-123”, workspace: “main” });
// data -> Workflow
```

---

## useFetchWorkflows

Fetches a paginated list of workflows (TanStack Query `useInfiniteQuery`) with cursor-based pagination. Automatically flattens all pages into a single `Workflow[]` via `select`.

**Parameters**
- `workspace` — workspace name passed as a direct query param (optional)
- `pageSize` — items per page (optional, default `10`)
- `queryOptions` — TanStack infinite query options (optional)

**Returns**
- `query` — full `useInfiniteQuery` result; `query.data` is a flat `Workflow[]`
- `queryKey` — stable cache key

**Example**
```ts
const { query } = useFetchWorkflows({ workspace: “ws-1”, pageSize: 20 });

const workflows = query.data ?? [];
```

---

## useWorkflowRunMutations

Mutation hook to execute a workflow asynchronously or synchronously. Shows error alerts via `useAppAlert`.

**Returns**
- `runAsync` — starts execution without waiting for result (non-blocking)
- `runSync` — runs execution and returns the result immediately (preferred when output is needed)

**Both accept**
- `{ id, workspace, parameters }` — workflow ID, workspace name, and parameters object

**Example**
```ts
const { runSync, runAsync } = useWorkflowRunMutations();

// Synchronous — get the result immediately
const result = await runSync.mutateAsync({
  id: “wf-123”,
  workspace: “ws-1”,
  parameters: { UID: “ABC123” },
});

// Asynchronous — fire and forget
runAsync.mutate({ id: “wf-123”, workspace: “ws-1”, parameters: {} });
```

---

## useFetchWorkflowExecution

Fetches a single workflow execution by ID (TanStack Query `useQuery`). Alerts on error via `useAppAlert`.

**Parameters**
- `workflowId` — workflow identifier (required)
- `workflowExecutionId` — execution identifier (required)
- `workspace` — workspace name (required)
- `queryOptions` — TanStack Query options (optional; defaults: `refetchOnMount: “always”`, `staleTime: 0`, `gcTime: 0`)

**Returns**
- All standard TanStack Query fields
- `queryKey` — stable cache key
- `data` is a single `WorkflowExecution` object

**Example**
```ts
const { data, isLoading } = useFetchWorkflowExecution({
  workflowId: “wf-123”,
  workflowExecutionId: “exec-456”,
  workspace: “main”,
});
// data -> WorkflowExecution
```

---

## useFetchWorkflowExecutions

Fetches a paginated list of executions for a single workflow (TanStack Query `useInfiniteQuery`) with cursor-based pagination. Automatically flattens all pages into a single `WorkflowExecution[]` via `select`.

**Parameters**
- `workflowId` — workflow identifier (required)
- `filters` — filter clauses (optional; must include a `workspace` filter)
- `order` — sort clauses (optional)
- `projection` — fields to include (optional)
- `pageSize` — items per page (optional, default `10`)
- `queryOptions` — TanStack infinite query options (optional)

**Returns**
- `query` — full `useInfiniteQuery` result; `query.data` is a flat `WorkflowExecution[]`
- `queryKey` — stable cache key

**Example**
```ts
const { query } = useFetchWorkflowExecutions({
  workflowId: “wf-123”,
  filters: [{ field: “workspace”, value: “main” }],
  pageSize: 20,
});

const executions = query.data ?? [];
```

---

## useFetchWorkerExecution

Fetches a single worker execution by ID (TanStack Query `useQuery`). Alerts on error via `useAppAlert`.

**Parameters**
- `workflowId` — workflow identifier (required)
- `workerExecutionId` — worker execution identifier (required)
- `workspace` — workspace name (required)
- `queryOptions` — TanStack Query options (optional; defaults: `refetchOnMount: “always”`, `staleTime: 0`, `gcTime: 0`)

**Returns**
- All standard TanStack Query fields
- `queryKey` — stable cache key
- `data` is a single `WorkerExecution` object

**Example**
```ts
const { data, isLoading } = useFetchWorkerExecution({
  workflowId: “wf-123”,
  workerExecutionId: “wkex-456”,
  workspace: “main”,
});
// data -> WorkerExecution
```

---

## useFetchWorkerExecutions

Fetches a paginated list of worker executions for a given workflow execution (TanStack Query `useInfiniteQuery`) with cursor-based pagination. Automatically flattens all pages into a single `WorkerExecution[]` via `select`.

**Parameters**
- `workflowId` — workflow identifier (required)
- `workflowExecutionId` — workflow execution identifier (required)
- `filters` — filter clauses (optional; must include a `workspace` filter)
- `order` — sort clauses (optional)
- `projection` — fields to include (optional)
- `pageSize` — items per page (optional, default `10`)
- `queryOptions` — TanStack infinite query options (optional)

**Returns**
- `query` — full `useInfiniteQuery` result; `query.data` is a flat `WorkerExecution[]`
- `queryKey` — stable cache key

**Example**
```ts
const { query } = useFetchWorkerExecutions({
  workflowId: “wf-123”,
  workflowExecutionId: “wfex-456”,
  filters: [{ field: “workspace”, value: “main” }],
  pageSize: 20,
});

const workerExecutions = query.data ?? [];
```

---

## useFetchWorkspace

Fetches a single workspace by name (TanStack Query `useQuery`). Alerts on error via `useAppAlert`.

**Parameters**
- `name` — workspace name (required)
- `queryOptions` — TanStack Query options (optional; defaults: `refetchOnMount: “always”`, `staleTime: 0`, `gcTime: 0`)

**Returns**
- All standard TanStack Query fields
- `queryKey` — stable cache key
- `data` is a single `Workspace` object

**Example**
```ts
const { data, isLoading } = useFetchWorkspace({ name: “main” });
// data -> Workspace
```

---

## useFetchWorkspaces

Fetches a paginated list of workspaces (TanStack Query `useInfiniteQuery`) with cursor-based pagination. Automatically flattens all pages into a single `Workspace[]` via `select`.

**Parameters**
- `workspace` — current workspace name, passed as a query param (optional)
- `pageSize` — items per page (optional, default `10`)
- `queryOptions` — TanStack infinite query options (optional)

**Returns**
- `query` — full `useInfiniteQuery` result; `query.data` is a flat `Workspace[]`
- `queryKey` — stable cache key

**Example**
```ts
const { query } = useFetchWorkspaces({ workspace: “main”, pageSize: 20 });

const workspaces = query.data ?? [];
```
