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
- React + TypeScript app scaffold with MUI and Tailwind.
- TanStack Query (React Query) used across hooks.
- Context providers for app config and alerts.
- Built-in Vite plugins and a dev server proxy.

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

## Getting started (development)
1. Install dependencies
   ```bash
   npm install
   ```
2. Start dev server
   ```bash
   npm run dev
   ```
   Default port: `5173` (configurable via `PORT` env var).

3. Open the app
   ```bash
   "$BROWSER" http://localhost:5173
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


## Vite notes (short)
- The project root is used as `envDir`.
- Dev-only config can be served from `/app-config.dev.json` via plugin.
- A dev proxy is enabled only when running `vite` in serve mode (`npm run dev`).


## Dev proxy (`/api`) (Vite)

The frontend uses `/api` as the base path for API calls.

- In **development** (`npm run dev`), Vite forwards `/api` requests via a dev proxy to the Everysk API.
- In **production**, `/api` is resolved by the hosting environment (server/gateway) to the Everysk API.

This keeps client code identical across environments—no manual base URL configuration is required.

**Required environment variables (dev)**
- `PROXY_SERVER_TARGET_URL`
- `AUTH_TOKEN`
- `ACCOUNT_SID`

---

# Providers (required wiring)

Wrap the app with providers so hooks can access config, alerts, broadcast channel and query client:

```tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AppConfigProvider } from "./contexts/appConfigContext";
import { AppAlertProvider } from "./contexts/appAlertContext";
import { BroadcastChannelProvider } from "./contexts/broadcastChannelContext";
import { QueryClientProvider } from "./utils/queryClient";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider>
    <AppConfigProvider>
      <AppAlertProvider>
        <BroadcastChannelProvider>
          <App />
        </BroadcastChannelProvider>
      </AppAlertProvider>
    </AppConfigProvider>
  </QueryClientProvider>
);
```

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
