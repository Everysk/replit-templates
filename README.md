# API Documentation (Merged)

## Index (main modules)

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

<!-- api-md/README.md -->

# Everysk — App Template

This README summarizes the project layout and how to use the React hooks, contexts and the Vite setup included in this repository.

Quick highlights
- React + TypeScript app scaffold with MUI and Tailwind.
- React Query used across hooks.
- Context providers for app config and alerts.
- Built-in Vite plugins and a dev server proxy.

Repository layout (important files/folders)
- src/
  - App.tsx, main.tsx — application entry and root component.
  - components/
    - themeProviderWrapper/ — theme wrapper available to the app.
    - ui/everyskIcon — small UI pieces.
  - contexts/
    - appConfigContext — appConfigProvider, types and index.
    - appAlertContext — appAlertProvider and types.
    - broadcastChannelContext — broadcast channel provider and helpers.
  - hooks/ — main integration surface. Hooks available:
    - useAppAlert.tsx
    - useAppConfig.tsx
    - useAxios.tsx
    - useBroadcastChannel.tsx
    - useBroadcastSubscription.tsx
    - useDatastoreMutations.tsx
    - useFetchDatastore.tsx
    - useFetchFile.tsx
    - useFetchPortfolio.tsx
    - useFileMutations.tsx
    - usePortfolioMutations.tsx
    - useRunWorkflowMutations.tsx
  - pages/ — route pages (home, index).
  - utils/ — api clients, query client setup and helpers.
- dev/
  - app-config.dev.json — development app config served by a Vite plugin.
- vite/
  - serverProxy.ts — built-in proxy configuration for the dev server.
  - plugins/
    - envVarsLocation.ts
    - serveDevAppConfig.ts — serves dev/app-config.dev.json during development.
- vite.config.ts — registers plugins and the dev server proxy.

Getting started (development)
1. Install dependencies
   ```
   npm install
   ```
2. Start dev server
   ```
   npm run dev
   ```
   By default the dev server will run on port 5173 (configurable by PORT env var).

3. Open the app in the host default browser
   ```
   "$BROWSER" http://localhost:5173
   ```

Build & preview
- Build:
  ```
  npm run build
  ```
- Preview built app:
  ```
  npm run preview
  ```

Vite specifics
- envDir: The project root is used as envDir so environment files and the `dev/app-config.dev.json` are read/served by custom plugins.
- Plugins included:
  - envVarsLocationPlugin — tracks where env vars are loaded from.
  - serveDevAppConfigPlugin — serves dev/app-config.dev.json to the client when running locally.
- Built-in dev proxy:
  - serverProxy.ts is used by vite.config.ts via createDevServerProxy() and is enabled for the dev server (when Vite runs the dev server).
  - The proxy is applied only when command === "serve" (the normal `npm run dev` flow). Use the proxy to forward API calls to backend services without changing client code.

Contexts and providers
- Wrap the app with the context providers (typically in main.tsx or App.tsx) so hooks can access them:
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

Detailed usage of hooks (patterns and examples)
Note: hooks in this project follow common React Query + context patterns. Typical return shapes:
- Queries: { data, error, isLoading, isFetching, refetch }
- Mutations: { mutate, mutateAsync, isLoading, isError, data, error }

1) useAxios
- Purpose: get a pre-configured axios instance (base URL, interceptors).
- Usage:
  ```ts
  import { useAxios } from "./hooks/useAxios";

  const MyComponent = () => {
    const axios = useAxios();

    useEffect(() => {
      axios.get("/some/endpoint").then(res => {
        console.log(res.data);
      });
    }, [axios]);

    return null;
  }
  ```

2) useFetchDatastore
- Purpose: typed TanStack Query hook for retrieving datastores.
- Key additions beyond the standard TanStack Query return:
  - `datastoresProps`: a metadata map keyed by datastore id (useful for UI).
    Typical shape:
    ```ts
    {
      "dt_1": { name: "...", date: "...", header: ["col1", "col2"], ... },
      "dt_2": { name: "...", date: "...", header: ["colA", "colB"], ... }
    }
    ```
  - `mergeResult` (when `id: null`) controls the shape of `data`:
    - `mergeResult: false` → `DefaultObject[][]` (rows grouped by datastore)
    - `mergeResult: true`  → `DefaultObject[]` (all rows flattened into a single array)

  Note: each row returned by `datastoreToObject(...)` includes the datastore identifier (e.g., `datastoreId`),
  so even with `mergeResult: true` you can trace each row back to its source datastore.

- Usage:
  ```ts
  import { useFetchDatastore } from "./hooks/useFetchDatastore";
  import type { FilterClause } from "./types/entityQuery";

  export function DatastoreResultsExample() {
    const filters: FilterClause[] = [
      { field: "workspace", value: "workspace" },
      { field: "link_uid", value: "linkuid" },

      // Inclusive date range (YYYYMMDD)
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
- When to use `mergeResult: true`:
  - Use it when you want a single list/table of rows across multiple datastores (e.g., a unified grid).
- When to use `mergeResult: false`:
  - Use it when you want to keep results grouped per datastore (e.g., one section/table per datastore).
3) usePortfolioMutations / useFileMutations / useDatastoreMutations / useRunWorkflowMutations
- Purpose: mutate remote resources (create, update, delete, trigger workflows).
- Usage:
  ```ts
  import { usePortfolioMutations } from "./hooks/usePortfolioMutations";

  const PortfolioEditor = () => {
    const { createPortfolio, updatePortfolio } = usePortfolioMutations();

    const onCreate = (payload) => {
      createPortfolio.mutate(payload, {
        onSuccess() { /* invalidate queries or show alert */ }
      });
    };

    return null;
  };
  ```
- Some mutation hooks expose multiple helpers (create/update/delete). Some may return single generic mutate functions. Check the hook file for exact API.

4) useAppConfig & useAppAlert
- Purpose: application-level configuration and alert UX.
- useAppConfig: read and (if allowed) update runtime config.
  ```ts
  import { useAppConfig } from "./hooks/useAppConfig";

  const ConfigViewer = () => {
    const { config, setConfig } = useAppConfig();
    // config shape from contexts/appConfigContext/appConfigType.ts
  };
  ```
- useAppAlert: show global alerts/snackbars.
  ```ts
  import { useAppAlert } from "./hooks/useAppAlert";

  const SomeAction = () => {
    const { showAlert } = useAppAlert();

    const onClick = () => showAlert({ message: "Saved", severity: "success" });
  };
  ```

5) useBroadcastChannel & useBroadcastSubscription
- Purpose: local broadcast channel messaging between tabs/components.
- Usage:
  ```ts
  import { useBroadcastChannel, useBroadcastSubscription } from "./hooks/useBroadcastChannel";

  const Sender = () => {
    const { postMessage } = useBroadcastChannel("my-channel");
    return <button onClick={() => postMessage({ type: "PING" })}>Ping</button>;
  };

  const Receiver = () => {
    useBroadcastSubscription("my-channel", (msg) => {
      console.log("received", msg);
    });

    return null;
  };
  ```
- Exact method names can differ; check broadcastChannelContext and hook implementations. Patterns are: create channel, post messages, subscribe/unsubscribe.

Best practices
- Use the query client (utils/queryClient.ts) to centralize caching and invalidation.
- Keep side effects in onSuccess/onError callbacks on mutations.
- Wrap the app with all providers so context hooks work.
- Inspect the hook files in src/hooks for exact parameters and return shapes before using in production.

Development config and local dev app config
- dev/app-config.dev.json is intended for local development and is served through serveDevAppConfigPlugin.
- The plugin and envVarsLocationPlugin let the client read dev-only config and see env var origins.

Where to look for more detail
- src/hooks/* — definitive hook implementations and TypeScript types.
- src/contexts/* — provider APIs and types for app-level context.
- vite/serverProxy.ts — how API routes are proxied for local development.
- vite/plugins/* — how development environment values and dev config are served.

---

<!-- api-md/contexts/appAlertContext/appAlertProvider/functions/AppAlertProvider.md -->

# Function: AppAlertProvider()

> **AppAlertProvider**(`__namedParameters`): `Element`

Defined in: `contexts/appAlertContext/appAlertProvider.tsx:45`

AppAlertProvider

React context provider responsible for exposing a global application alert API and rendering
a Material UI `Snackbar` + `Alert` pair anchored to the viewport.

What this provider does:
- Maintains an internal `AppAlertState` that controls:
  - visibility (`open`)
  - displayed text (`message`)
  - alert tone (`severity`)
  - auto-dismiss timing (`autoHideDuration`)
  - screen position (`anchorOrigin`)
- Exposes an imperative API via context:
  - `showAlert(options)` to open/update the alert
  - `hideAlert()` to close the alert
- Renders the `Snackbar`/`Alert` components once (at the provider level), so any descendant can
  trigger alerts without needing to manage UI state locally.

Behavior:
- `showAlert(options)` performs a shallow merge of the provided options into the current state
  and forces `open: true`.
- `hideAlert()` sets `open: false` (preserving the remaining state).
- Snackbar `onClose` ignores the `"clickaway"` reason to prevent accidental dismissals when the user
  clicks outside the toast.

---

<!-- api-md/contexts/appConfigContext/appConfigProvider/functions/AppConfigProvider.md -->

# Function: AppConfigProvider()

> **AppConfigProvider**(`__namedParameters`): `Element`

Defined in: `contexts/appConfigContext/appConfigProvider.tsx:52`

AppConfigProvider

React context provider responsible for exposing the application's runtime configuration (`AppConfigContextType`)
to the component tree.

Configuration sources:
- `window.APP_CONFIG`:
  Base configuration injected into the page (e.g., by the server in `index.html`) and available at runtime.

- `/app-config.dev.json` (DEV only):
  Optional development override file that is fetched during application bootstrap (before React is mounted),
  typically in `main.tsx`. If present, its values are shallow-merged into `window.APP_CONFIG`, overriding
  top-level keys from the base config.

Merge strategy:
- A shallow merge is performed during bootstrap:
  - `window.APP_CONFIG = { ...window.APP_CONFIG, ...devEnvConfig }`
- This means top-level keys in `devEnvConfig` override matching keys in `window.APP_CONFIG`.
- Nested objects are not deep-merged; if a nested object key exists in `devEnvConfig`, it replaces
  the entire nested object from the base config.

Provider value (AppConfigContextType):
- `appId`:
  Read from `window.APP_ID` (or `null` if not defined).
- `appEnvironmentVar`:
  The final runtime configuration object from `window.APP_CONFIG` (already merged during bootstrap).

Example:
```ts
// App root
<AppConfigProvider>
  <App />
</AppConfigProvider>

// Consumer hook usage
const { appId, appEnvironmentVar } = useAppConfig();
console.log(appId, appEnvironmentVar);
```
---

<!-- api-md/contexts/broadcastChannelContext/broadcastChannelHandler/classes/BroadcastChannelHandler.md -->

# Class: BroadcastChannelHandler

Defined in: `contexts/broadcastChannelContext/broadcastChannelHandler.tsx:46`

BroadcastChannelHandler

Minimal wrapper around the browser `BroadcastChannel` API that provides a small pub/sub layer.

Features:
- Opens a `BroadcastChannel` instance with the provided channel `name`.
- Keeps an in-memory `Set` of subscribed callbacks (`_listeners`).
- For each incoming `BroadcastChannel` message, forwards the payload (`event.data`) to all listeners.

API:
- `listen(callback)`:
  Registers a listener to receive incoming messages.
  Returns an unsubscribe function that removes the callback from the internal set.

- `sendMessage(message)`:
  Publishes a message to the channel via `BroadcastChannel.postMessage`.

- `close()`:
  Clears all listeners and closes the underlying channel. After calling `close()`, the handler
  should be considered unusable.

Notes:
- The native `BroadcastChannel` delivers messages as a `MessageEvent`, but this handler exposes
  only the payload (`event.data`) to listeners, typed as `Message`.
- Message delivery is best-effort: if a listener throws, it can affect subsequent listeners unless
  callers ensure their callbacks are safe. If needed, wrap callbacks with try/catch at call sites.

Example:
```ts
const handler = new BroadcastChannelHandler("my-channel");

const unsubscribe = handler.listen((msg) => {
  console.log("received:", msg);
});

handler.sendMessage({ type: "PING", payload: { at: Date.now() } });

unsubscribe();
handler.close();
```

## Constructors

### Constructor

> **new BroadcastChannelHandler**(`name`): `BroadcastChannelHandler`

Defined in: `contexts/broadcastChannelContext/broadcastChannelHandler.tsx:50`

#### Parameters

##### name

`string`

#### Returns

`BroadcastChannelHandler`

## Methods

### close()

> **close**(): `void`

Defined in: `contexts/broadcastChannelContext/broadcastChannelHandler.tsx:68`

#### Returns

`void`

### listen()

> **listen**(`callback`): () => `void`

Defined in: `contexts/broadcastChannelContext/broadcastChannelHandler.tsx:59`

#### Parameters

##### callback

(`msg`) => `void`

#### Returns

> (): `void`

##### Returns

`void`

### sendMessage()

> **sendMessage**(`message`): `void`

Defined in: `contexts/broadcastChannelContext/broadcastChannelHandler.tsx:64`

#### Parameters

##### message

[`Message`](../../broadcastChannelType/type-aliases/Message.md)

#### Returns

`void`

---

<!-- api-md/contexts/broadcastChannelContext/broadcastChannelProvider/functions/BroadcastChannelProvider.md -->

# Function: BroadcastChannelProvider()

> **BroadcastChannelProvider**(`__namedParameters`): `Element`

Defined in: `contexts/broadcastChannelContext/broadcastChannelProvider.tsx:70`

BroadcastChannelProvider

React context provider that exposes a lightweight pub/sub API backed by the native `BroadcastChannel`
(via `BroadcastChannelHandler`). It is designed to support cross-tab (and same-origin) communication.

What this provider does:
- Creates a single `BroadcastChannelHandler` instance for the application (keyed by `APP_ID`).
- Exposes a context value with:
  - `post(message)` to publish messages to the channel
  - `subscribe(fn)` to register listeners and receive messages
  - `lastMessage` as a convenience snapshot of the most recently received message

Why the "buffer" exists (`pendingRef`):
- The handler is created inside `useEffect`, which runs after the initial render commit.
- Consumers can call `subscribe` before the handler is ready (e.g., during early lifecycle
  or due to ordering of effects).
- To prevent losing subscriptions, we buffer callbacks in `pendingRef` and flush (register)
  them once the handler is created.

Buffering behavior:
- If `subscribe(fn)` is called before the handler exists:
  - `fn` is stored in `pendingRef` with a `null` unsubscribe placeholder.
  - Once the handler is created, all pending callbacks are registered and their real unsubscribe
    functions are stored back into the map.
- The function returned by `subscribe` always performs proper cleanup:
  - If the callback was still pending, it is removed from the map.
  - If it was already registered, it calls the real unsubscribe and then removes it.

Important notes:
- `APP_ID` is assumed static for the lifetime of the page (injected into `index.html` before bundle execution).
- `lastMessage` updates on every received message, which re-renders all context consumers that read the
  context value. For high-throughput channels, consider splitting state into a separate context or removing
  `lastMessage` entirely if not required.
- Consumers should subscribe inside `useEffect` and return the cleanup function to avoid accumulating listeners:

Example:
```ts
const { subscribe, post } = useBroadcastChannel();

useEffect(() => {
  const unsub = subscribe((msg) => console.info("received:", msg));
  return unsub;
}, [subscribe]);

post({ type: "PING", payload: { at: Date.now() } });
```

Provider value (BroadcastChannelContextType):

## Parameters

### \_\_namedParameters

[`BroadcastChannelProviderProps`](../../broadcastChannelType/type-aliases/BroadcastChannelProviderProps.md)

## Returns

`Element`

- `post(message: Message): void`
   Publishes a message to the underlying channel.
 - `subscribe(fn: (m: Message) => void): () => void`
   Registers a listener and returns an unsubscribe function.
   Subscription is buffered if the channel is not yet initialized.
 - `lastMessage: Message | null`
   The most recently received message (or null if none received yet).

---

<!-- api-md/hooks/useAppAlert/functions/default.md -->

# Hook: useAppAlert()
> **useAppAlert**(): [`AppAlertContextType`](../../../contexts/appAlertContext/appAlertType/type-aliases/AppAlertContextType.md)

Defined in: `hooks/useAppAlert.tsx:34`

useAppAlert

Convenience hook that reads the alert API from `AppAlertContext`.

Behavior:
- Returns the functions exposed by `<AppAlertProvider>`, typically:
  - `showAlert(options)` to display an alert
  - `hideAlert()` to close the current alert

Error handling:
- Throws a descriptive error if called outside of an `<AppAlertProvider>` scope, to fail fast
  and prevent silent no-op alert calls.

Usage:
```ts
const { showAlert } = useAppAlert();

showAlert({
  message: "Saved successfully.",
  severity: "success",
  autoHideDuration: 3000,
});
```

## Returns

[`AppAlertContextType`](../../../contexts/appAlertContext/appAlertType/type-aliases/AppAlertContextType.md)

## Throws

Throws if the hook is used outside of `<AppAlertProvider>`.

---

<!-- api-md/hooks/useAppConfig/functions/default.md -->

# Hook: useAppConfig()
> **useAppConfig**(): [`AppConfigContextType`](../../../contexts/appConfigContext/appConfigType/type-aliases/AppConfigContextType.md)

Defined in: `hooks/useAppConfig.tsx:24`

useAppConfig

Convenience hook that reads the current application configuration from `AppConfigContext`.

Behavior:
- Returns the `AppConfigContextType` value provided by `<AppConfigProvider>`.
- Throws a descriptive error if called outside of an `<AppConfigProvider>` scope, to fail fast and
  avoid undefined configuration usage throughout the app.

Usage:
```ts
const { appId, appEnvironmentVar } = useAppConfig();
```

## Returns

[`AppConfigContextType`](../../../contexts/appConfigContext/appConfigType/type-aliases/AppConfigContextType.md)

## Throws

Throws if the hook is used outside of `<AppConfigProvider>`.

---

<!-- api-md/hooks/useAxios/functions/default.md -->

# Hook: useAxios()
> **useAxios**(`url?`): `object`

Defined in: `hooks/useAxios.tsx:39`

useAxios

Axios client hook that returns a memoized `AxiosInstance` configured with:
- `baseURL` derived from:
  - the optional `url` parameter, or
  - `/api` as default

Request behavior:
- Registers a request interceptor that, for `GET` and `DELETE` requests, attempts to parse
  `config.params.query` (expected to be a JSON string) and extract a `workspace` filter from it.
- If a `workspace` value is found, it is injected into `config.params.workspace`.

Lifecycle / cleanup:
- The interceptor is attached in `useEffect` and ejected on cleanup to avoid stacking interceptors
  across re-renders or unmount/mount cycles.

Notes:
- `params.query` parsing is best-effort. Invalid JSON is ignored.
- This hook assumes a query structure containing `filters`, where the workspace filter is identified by
  `filter[0] === "workspace"`.

Parameters:

## Parameters

### url?

Optional base URL override. If omitted/null, defaults to `/api`.

Return value:

`string` | `null`

## Returns

`object`

Returns an object containing the configured Axios instance.

### api

> **api**: `AxiosInstance`

---

<!-- api-md/hooks/useBroadcastChannel/functions/default.md -->

# Hook: useBroadcastChannel()
> **useBroadcastChannel**(): [`BroadcastChannelContextType`](../../../contexts/broadcastChannelContext/broadcastChannelType/type-aliases/BroadcastChannelContextType.md)

Defined in: `hooks/useBroadcastChannel.tsx:36`

useBroadcastChannel

Convenience hook that reads the broadcast channel API from `BroadcastChannelContext`.

Behavior:
- Returns the context value exposed by `<BroadcastChannelProvider>`, typically including:
  - `post(message)` to publish messages
  - `subscribe(fn)` to listen for messages (returns an unsubscribe function)
  - `lastMessage` as the latest received message snapshot (if provided by the context)

Error handling:
- Throws a descriptive error if invoked outside of a `<BroadcastChannelProvider>` scope, to fail fast
  and prevent silent no-op subscriptions or missing cross-tab communication.

Usage:
```ts
const { subscribe, post } = useBroadcastChannel();

useEffect(() => {
  const unsub = subscribe((msg) => console.log(msg));
  return unsub;
}, [subscribe]);

post({ type: "PING", payload: { at: Date.now() } });
```

## Returns

[`BroadcastChannelContextType`](../../../contexts/broadcastChannelContext/broadcastChannelType/type-aliases/BroadcastChannelContextType.md)

## Throws

Throws if the hook is used outside of `<BroadcastChannelProvider>`.

---

<!-- api-md/hooks/useBroadcastSubscription/functions/default.md -->

# Hook: useBroadcastSubscription()
> **useBroadcastSubscription**(`handler`): `void`

Defined in: `hooks/useBroadcastSubscription.tsx:30`

useBroadcastSubscription

High-level helper hook that subscribes to the BroadcastChannel on mount and unsubscribes on unmount.

Why this exists:
- Enforces the correct subscription pattern (`useEffect` + cleanup).
- Prevents accidental multiple subscriptions from re-renders.
- Uses a ref-backed handler so the subscription does not need to be recreated when the callback identity changes.

Parameters:

## Parameters

### handler

(`msg`) => `void`

Callback invoked for every received message. Filtering (e.g., by `msg.type`) is intentionally left
 to the consumer.

Example:
```ts
useBroadcastSubscription((msg) => {
  if (msg.type === "PING") {
    console.log("ping:", msg.payload);
  }
});
```

## Returns

`void`

---

<!-- api-md/hooks/useDatastoreMutations/functions/default.md -->

# Hook: useDatastoreMutations()
> **useDatastoreMutations**(`queryKey?`): `object`

Defined in: `hooks/useDatastoreMutations.tsx:159`

useDatastoreMutations

Mutation hook built on TanStack Query to perform Datastore write operations:
- create a datastore (POST)
- update a datastore (PUT)
- delete a datastore (DELETE)

It also:
- optionally invalidates a target query cache key after successful mutations
- displays success/error alerts via `useAppAlert`

Important notes:
- This hook is intended for side-effect operations only. Reading/retrieving data should be done via `useQuery` or `useFetchDatastore`.
- Cache invalidation is controlled by `queryKey`. If `queryKey` is not provided, the hook will still run
  mutations and show alerts, but it will NOT invalidate any cached queries.
- `remove` requires a `workspace` parameter because the underlying API helper `deleteDatastore(api, id, workspace)`
  expects it as a query param.

Parameters (UseDatastoreMutationsProps):

## Parameters

### queryKey?

`UseDatastoreMutationsProps`

Query key to invalidate after successful mutations. Use the same `queryKey` you pass to the relevant `useQuery`
 (e.g., datastore list/detail) so UI data is refreshed automatically after a write.

 Tip:
 - If you're using `useFetchDatastore`, you can pass its returned `queryKey` directly:
   `const fetch = useFetchDatastore(...);`
   `useDatastoreMutations({ queryKey: fetch.queryKey });`

Mutations:
- `create`:
  - mutationFn: `postDatastore(api, data)`
  - variables: `{ data: Partial<Datastore> }`
  - success message: "Datastore created successfully."
  - error message: "Unable to create the datastore. Please try again." (fallback)

- `update`:
  - mutationFn: `updateDatastore(api, id, data)`
  - variables: `{ id: string; data: Partial<Datastore> }`
  - success message: "Datastore updated successfully."
  - error message: "Unable to update the datastore. Please try again." (fallback)

- `remove`:
  - mutationFn: `deleteDatastore(api, id, workspace)`
  - variables: `{ id: string; workspace: string }`
  - success message: "Datastore deleted successfully."
  - error message: "Unable to delete the datastore. Please try again." (fallback)

Return value:

## Returns

`object`

Returns an object with the three TanStack Query mutation results:
 - `create`: UseMutationResult<Datastore, Error, CreateDatastoreProps, unknown>
 - `update`: UseMutationResult<Datastore, Error, UpdateDatastoreProps, unknown>
 - `remove`: UseMutationResult<Datastore, Error, DeleteDatastoreProps, unknown>

Each mutation includes standard TanStack Query helpers:
- `mutate(variables, options?)`
- `mutateAsync(variables, options?)`
- `isPending`, `isSuccess`, `isError`, `error`, `data`, etc.

Examples:

1) Invalidate a datastore list query after mutations:
```ts
const { create, update, remove } = useDatastoreMutations({ queryKey: ["datastore"] });

// Create
create.mutate({
  data: {
    name: "My datastore",
    workspace: "ws-1",
    data: [["id", "name"], ["ABEOX135", "Jorge"]],
  }
});

// Update
update.mutate({
  id: "ds-123",
  data: {
    name: "Renamed datastore",
    data: [["id", "name"], ["ABEOX135", "Jorge"]],
  }
});

// Delete
remove.mutate({
  id: "ds-123",
  workspace: "ws-1"
});
```

2) Using async/await with `mutateAsync`:
```ts
const { create } = useDatastoreMutations({ queryKey: ["datastore"] });

await create.mutateAsync({
  data: {
    name: "My datastore",
    workspace: "ws-1",
    data: [["id", "name"], ["ABEOX135", "Jorge"]],
  }
});
```

3) Without cache invalidation (no queryKey):
```ts
const { update } = useDatastoreMutations({});

update.mutate({
  id: "ds-123",
  data: { name: "Renamed datastore" }
});
// Mutation still runs and alerts are shown, but cached queries are not invalidated.
```

4) Using `useFetchDatastore` queryKey for automatic invalidation:
```ts
const fetch = useFetchDatastore({
  id: null,
  filters: [{ field: "workspace", value: "ws-1" }],
});

const { create } = useDatastoreMutations({ queryKey: fetch.queryKey });

await create.mutateAsync({
  data: { name: "My datastore", workspace: "ws-1" }
});
```

### create

> **create**: `UseMutationResult`\<[`Datastore`](../../../types/datastore/type-aliases/Datastore.md), `unknown`, `CreateDatastoreProps`, `unknown`\>

### remove

> **remove**: `UseMutationResult`\<[`Datastore`](../../../types/datastore/type-aliases/Datastore.md), `unknown`, `DeleteDatastoreProps`, `unknown`\>

### update

> **update**: `UseMutationResult`\<[`Datastore`](../../../types/datastore/type-aliases/Datastore.md), `unknown`, `UpdateDatastoreProps`, `unknown`\>

---

<!-- api-md/hooks/useFetchDatastore/functions/default.md -->

# Hook: useFetchDatastore()
> **useFetchDatastore**(`id`): \{ `datastoresProps`: [`DefaultObject`](../../../types/defaultObject/type-aliases/DefaultObject.md); `queryKey`: `unknown`[]; \} \| \{ `datastoresProps`: [`DefaultObject`](../../../types/defaultObject/type-aliases/DefaultObject.md); `queryKey`: `unknown`[]; \} \| \{ `datastoresProps`: [`DefaultObject`](../../../types/defaultObject/type-aliases/DefaultObject.md); `queryKey`: `unknown`[]; \} \| \{ `datastoresProps`: [`DefaultObject`](../../../types/defaultObject/type-aliases/DefaultObject.md); `queryKey`: `unknown`[]; \} \| \{ `datastoresProps`: [`DefaultObject`](../../../types/defaultObject/type-aliases/DefaultObject.md); `queryKey`: `unknown`[]; \} \| \{ `datastoresProps`: [`DefaultObject`](../../../types/defaultObject/type-aliases/DefaultObject.md); `queryKey`: `unknown`[]; \}

Defined in: `hooks/useFetchDatastore.tsx:130`

useFetchDatastore

Data-fetching hook built on TanStack Query to retrieve:
- a single datastore (when `id` is provided), or
- a list of datastores (when `id` is null)

It also:
- builds a helper map `datastoresProps` (metadata keyed by datastore `id`) for UI usage
- optionally merges list results into a single array when `mergeResult` is true

Important notes:
- The query return shape varies by scenario:
  - If `id` is provided: returns `DefaultObject[]` (rows for that datastore)
  - If `id` is null and `mergeResult` is false: returns `DefaultObject[][]` (rows grouped by datastore)
  - If `id` is null and `mergeResult` is true: returns `DefaultObject[]` (merged/flattened result)

- Each returned row is augmented with the datastore identifier:
  - `datastoreToObject(...)` adds a datastore id field to every row, so downstream consumers
    can trace each record back to its source datastore.

- The hook triggers an error alert via `useAppAlert` whenever `query.error` is present.

Parameters (FetchDatastoreProps):

## Parameters

### id

[`FetchDatastoreProps`](../type-aliases/FetchDatastoreProps.md)

Datastore identifier. If provided, fetches only that datastore.
 If null, fetches the datastore list using filters/ordering.

## Returns

\{ `datastoresProps`: [`DefaultObject`](../../../types/defaultObject/type-aliases/DefaultObject.md); `queryKey`: `unknown`[]; \} \| \{ `datastoresProps`: [`DefaultObject`](../../../types/defaultObject/type-aliases/DefaultObject.md); `queryKey`: `unknown`[]; \} \| \{ `datastoresProps`: [`DefaultObject`](../../../types/defaultObject/type-aliases/DefaultObject.md); `queryKey`: `unknown`[]; \} \| \{ `datastoresProps`: [`DefaultObject`](../../../types/defaultObject/type-aliases/DefaultObject.md); `queryKey`: `unknown`[]; \} \| \{ `datastoresProps`: [`DefaultObject`](../../../types/defaultObject/type-aliases/DefaultObject.md); `queryKey`: `unknown`[]; \} \| \{ `datastoresProps`: [`DefaultObject`](../../../types/defaultObject/type-aliases/DefaultObject.md); `queryKey`: `unknown`[]; \}

Returns TanStack Query's `query` object extended with:
 - `queryKey`: the cache key used by React Query
 - `datastoresProps`: a map of datastore metadata keyed by datastore id

Examples:

1) Fetch a single datastore:
```ts
const { data, isLoading, datastoresProps } = useFetchDatastore({
  id: "abc123",
  filters: [{ field: "workspace", value: "my-workspace" }],
});
// data -> DefaultObject[] (rows, each including the datastore id field)
// datastoresProps["abc123"] -> metadata built from the datastore
```

2) Fetch a list of datastores without merging:
```ts
const { data } = useFetchDatastore({
  id: null,
  filters: [{ field: "workspace", value: "my-workspace" }],
  order: ["created desc"],
  mergeResult: false,
});
// data -> DefaultObject[][] (rows grouped by datastore, each row includes its datastore id)
```

3) Fetch a list of datastores with merging:
```ts
const { data } = useFetchDatastore({
  id: null,
  filters: [{ field: "workspace", value: "my-workspace" }],
  mergeResult: true,
});
// data -> DefaultObject[] (merged rows, each row includes its datastore id)
```

---

<!-- api-md/hooks/useFetchDatastore/type-aliases/FetchDatastoreProps.md -->

# Type Alias: FetchDatastoreProps\<TData, TSelected\>

> **FetchDatastoreProps**\<`TData`, `TSelected`\> = [`FetchEntityParams`](../../../types/entityQuery/type-aliases/FetchEntityParams.md)\<`TData`, `TSelected`\> & `object`

Defined in: `hooks/useFetchDatastore.tsx:14`

## Type Declaration

### mergeResult?

> `optional` **mergeResult**: `boolean`

---

<!-- api-md/hooks/useFetchFile/functions/default.md -->

# Hook: useFetchFile()
> **useFetchFile**(`id`): \{ `queryKey`: `unknown`[]; \} \| \{ `queryKey`: `unknown`[]; \} \| \{ `queryKey`: `unknown`[]; \} \| \{ `queryKey`: `unknown`[]; \} \| \{ `queryKey`: `unknown`[]; \} \| \{ `queryKey`: `unknown`[]; \}

Defined in: `hooks/useFetchFile.tsx:117`

useFetchFile

Data-fetching hook built on TanStack Query to retrieve:
- a single file (when `id` is provided), or
- a list of files (when `id` is null)

It also:
- builds a stable React Query `queryKey` that can be reused by mutation hooks for cache invalidation
- triggers an error alert via `useAppAlert` whenever `query.error` is present

Important notes:
- The query always returns `File[]`:
  - If `id` is provided: returns `[File]` (single-item array)
  - If `id` is null: returns `File[]` (list)

- When `id` is provided, a `workspace` filter is expected because `getFile`
  requires a `workspace` value.

- File content:
  - `File.data` represents the file content and is expected to be a Base64-encoded string when provided
    by the API (or when sending content through mutations).

Parameters (FetchFileProps):

## Parameters

### id

[`FetchFileProps`](../type-aliases/FetchFileProps.md)

File identifier. If provided, fetches only that file.
 If null, fetches the file list using filters/ordering.

## Returns

\{ `queryKey`: `unknown`[]; \} \| \{ `queryKey`: `unknown`[]; \} \| \{ `queryKey`: `unknown`[]; \} \| \{ `queryKey`: `unknown`[]; \} \| \{ `queryKey`: `unknown`[]; \} \| \{ `queryKey`: `unknown`[]; \}

Returns TanStack Query's `query` object extended with:
 - `queryKey`: the cache key used by React Query

Tip:
- The returned `queryKey` can be reused by mutation hooks for cache invalidation:
  `const fetch = useFetchFile(...);`
  `useFileMutations({ queryKey: fetch.queryKey });`

Examples:

1) Fetch a single file:
```ts
const { data, isLoading } = useFetchFile({
  id: "file-123",
  filters: [{ field: "workspace", value: "ws-1" }],
});
// data -> File[] (single-item array)
```

2) Fetch a list of files:
```ts
const { data } = useFetchFile({
  id: null,
  filters: [{ field: "workspace", value: "ws-1" }],
  order: ["created desc"],
});
// data -> File[]
```

3) Reuse queryKey for invalidation in mutations:
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
    link_uid: null,
    data: "SGVsbG8gd29ybGQ=", // Base64 content
  }
});
```

---

<!-- api-md/hooks/useFetchFile/type-aliases/FetchFileProps.md -->

# Type Alias: FetchFileProps\<TData, TSelected\>

> **FetchFileProps**\<`TData`, `TSelected`\> = [`FetchEntityParams`](../../../types/entityQuery/type-aliases/FetchEntityParams.md)\<`TData`, `TSelected`\>

Defined in: `hooks/useFetchFile.tsx:12`

---

<!-- api-md/hooks/useFetchPortfolio/functions/default.md -->

# Hook: useFetchPortfolio()
> **useFetchPortfolio**(`id`): \{ `queryKey`: `unknown`[]; \} \| \{ `queryKey`: `unknown`[]; \} \| \{ `queryKey`: `unknown`[]; \} \| \{ `queryKey`: `unknown`[]; \} \| \{ `queryKey`: `unknown`[]; \} \| \{ `queryKey`: `unknown`[]; \}

Defined in: `hooks/useFetchPortfolio.tsx:104`

useFetchPortfolio

Data-fetching hook built on TanStack Query to retrieve:
- a single portfolio (when `id` is provided), or
- a list of portfolios (when `id` is null)

It also:
- builds a stable React Query `queryKey` that can be reused by mutation hooks for cache invalidation
- triggers an error alert via `useAppAlert` whenever `query.error` is present

Important notes:
- The query always returns `Portfolio[]`:
  - If `id` is provided: returns `[Portfolio]` (single-item array)
  - If `id` is null: returns `Portfolio[]` (list)

- When `id` is provided, a `workspace` filter is expected because `getPortfolio`
  requires a `workspace` value.

Parameters (FetchPortfolioProps):

## Parameters

### id

[`FetchPortfolioProps`](../type-aliases/FetchPortfolioProps.md)

Portfolio identifier. If provided, fetches only that portfolio.
 If null, fetches the portfolio list using filters/ordering.

## Returns

\{ `queryKey`: `unknown`[]; \} \| \{ `queryKey`: `unknown`[]; \} \| \{ `queryKey`: `unknown`[]; \} \| \{ `queryKey`: `unknown`[]; \} \| \{ `queryKey`: `unknown`[]; \} \| \{ `queryKey`: `unknown`[]; \}

Returns TanStack Query's `query` object extended with:
 - `queryKey`: the cache key used by React Query

Tip:
- The returned `queryKey` can be reused by mutation hooks for cache invalidation:
  `const fetch = useFetchPortfolio(...);`
  `usePortfolioMutations({ queryKey: fetch.queryKey });`

Examples:

1) Fetch a single portfolio:
```ts
const { data, isLoading } = useFetchPortfolio({
  id: "pf-123",
  filters: [{ field: "workspace", value: "ws-1" }],
});
// data -> Portfolio[] (single-item array)
```

2) Fetch a list of portfolios:
```ts
const { data } = useFetchPortfolio({
  id: null,
  filters: [{ field: "workspace", value: "ws-1" }],
  order: ["created desc"],
});
// data -> Portfolio[]
```

3) Reuse queryKey for invalidation in mutations:
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

<!-- api-md/hooks/useFetchPortfolio/type-aliases/FetchPortfolioProps.md -->

# Type Alias: FetchPortfolioProps\<TData, TSelected\>

> **FetchPortfolioProps**\<`TData`, `TSelected`\> = [`FetchEntityParams`](../../../types/entityQuery/type-aliases/FetchEntityParams.md)\<`TData`, `TSelected`\>

Defined in: `hooks/useFetchPortfolio.tsx:10`

---

<!-- api-md/hooks/useFileMutations/functions/default.md -->

# Hook: useFileMutations()
> **useFileMutations**(`queryKey?`): `object`

Defined in: `hooks/useFileMutations.tsx:169`

useFileMutations

Mutation hook built on TanStack Query to perform File write operations:
- create a file (POST)
- update a file (PUT)
- delete a file (DELETE)

It also:
- optionally invalidates a target query cache key after successful mutations
- displays success/error alerts via `useAppAlert`

Important notes:
- This hook is intended for side-effect operations only. Reading/retrieving data should be done via `useQuery` or `useFetchFile`.
- Cache invalidation is controlled by `queryKey`. If `queryKey` is not provided, the hook will still run
  mutations and show alerts, but it will NOT invalidate any cached queries.
- `remove` requires a `workspace` parameter because the underlying API helper `deleteFile(api, id, workspace)`
  expects it as a query param.

- File content (`data`):
  - When creating/updating a file, the file content must be provided in `data` as a Base64-encoded string.
  - Send only the raw Base64 content (do not include a data URL prefix like `data:<mime>;base64,`)
  - `content_type` should match the file MIME type (e.g., "text/csv", "application/pdf").

Parameters (UseFileMutationsProps):

## Parameters

### queryKey?

`UseFileMutationsProps`

Query key to invalidate after successful mutations. Use the same `queryKey` you pass to the relevant `useQuery`
 (e.g., file list/detail) so UI data is refreshed automatically after a write.

 Tip:
 - If you're using `useFetchFile`, you can pass its returned `queryKey` directly:
   `const fetch = useFetchFile(...);`
   `useFileMutations({ queryKey: fetch.queryKey });`

Mutations:
- `create`:
  - mutationFn: `postFile(api, data)`
  - variables: `{ data: Partial<File> }`
  - success message: "File created successfully."
  - error message: "Unable to create the file. Please try again." (fallback)

- `update`:
  - mutationFn: `updateFile(api, id, data)`
  - variables: `{ id: string; data: Partial<File> }`
  - success message: "File updated successfully."
  - error message: "Unable to update the file. Please try again." (fallback)

- `remove`:
  - mutationFn: `deleteFile(api, id, workspace)`
  - variables: `{ id: string; workspace: string }`
  - success message: "File deleted successfully."
  - error message: "Unable to delete the file. Please try again." (fallback)

Return value:

## Returns

`object`

Returns an object with the three TanStack Query mutation results:
 - `create`: UseMutationResult<File, Error, CreateFileProps, unknown>
 - `update`: UseMutationResult<File, Error, UpdateFileProps, unknown>
 - `remove`: UseMutationResult<File, Error, DeleteFileProps, unknown>

Each mutation includes standard TanStack Query helpers:
- `mutate(variables, options?)`
- `mutateAsync(variables, options?)`
- `isPending`, `isSuccess`, `isError`, `error`, `data`, etc.

Examples:

1) Invalidate a file list query after mutations:
```ts
const { create, update, remove } = useFileMutations({ queryKey: ["file"] });

// Create
create.mutate({
  data: {
    name: "My file",
    workspace: "ws-1",
    content_type: "text/plain",
    version: "1",
    link_uid: null,
    data: "SGVsbG8gd29ybGQ=", // Base64 content
  }
});

// Update
update.mutate({
  id: "file-123",
  data: {
    name: "Renamed file",
    content_type: "text/plain",
    data: "SGVsbG8gd29ybGQ=", // Base64 content (optional if only renaming)
  }
});

// Delete
remove.mutate({ id: "file-123", workspace: "ws-1" });
```

2) Using async/await with `mutateAsync`:
```ts
const { create } = useFileMutations({ queryKey: ["file"] });

await create.mutateAsync({
  data: {
    name: "My file",
    workspace: "ws-1",
    content_type: "text/plain",
    version: "1",
    link_uid: null,
    data: "SGVsbG8gd29ybGQ=",
  }
});
```

3) Without cache invalidation (no queryKey):
```ts
const { update } = useFileMutations({});

update.mutate({
  id: "file-123",
  data: {
    name: "New name",
    content_type: "text/plain",
  }
});
// Mutation still runs and alerts are shown, but cached queries are not invalidated.
```

4) Using `useFetchFile` queryKey for automatic invalidation:
```ts
const fetch = useFetchFile({
  id: null,
  filters: [{ field: "workspace", value: "ws-1" }],
});

const { remove } = useFileMutations({ queryKey: fetch.queryKey });

await remove.mutateAsync({ id: "file-123", workspace: "ws-1" });
```

### create

> **create**: `UseMutationResult`\<[`File`](../../../types/file/type-aliases/File.md), `unknown`, `CreateFileProps`, `unknown`\>

### remove

> **remove**: `UseMutationResult`\<[`File`](../../../types/file/type-aliases/File.md), `unknown`, `DeleteFileProps`, `unknown`\>

### update

> **update**: `UseMutationResult`\<[`File`](../../../types/file/type-aliases/File.md), `unknown`, `UpdateFileProps`, `unknown`\>

---

<!-- api-md/hooks/usePortfolioMutations/functions/default.md -->

# Hook: usePortfolioMutations()
> **usePortfolioMutations**(`queryKey?`): `object`

Defined in: `hooks/usePortfolioMutations.tsx:179`

usePortfolioMutations

Mutation hook built on TanStack Query to perform Portfolio write operations:
- create a portfolio (POST)
- update a portfolio (PUT)
- delete a portfolio (DELETE)

It also:
- optionally invalidates a target query cache key after successful mutations
- displays success/error alerts via `useAppAlert`

Important notes:
- This hook is intended for side-effect operations only. Reading/retrieving data should be done via `useQuery` or `useFetchPortfolio`.
- Cache invalidation is controlled by `queryKey`. If `queryKey` is not provided, the hook will still run
  mutations and show alerts, but it will NOT invalidate any cached queries.
- `remove` requires a `workspace` parameter because the underlying API helper `deletePortfolio(api, id, workspace)`
  expects it as a query param.

Parameters (UsePortfolioMutationsProps):

## Parameters

### queryKey?

`UsePortfolioMutationsProps`

Query key to invalidate after successful mutations. Use the same `queryKey` you pass to the relevant `useQuery`
 (e.g., portfolio list/detail) so UI data is refreshed automatically after a write.

 Tip:
 - If you're using `useFetchPortfolio`, you can pass its returned `queryKey` directly:
   `const fetch = useFetchPortfolio(...);`
   `usePortfolioMutations({ queryKey: fetch.queryKey });`

Mutations:
- `create`:
  - mutationFn: `postPortfolio(api, data)`
  - variables: `{ data: Partial<Portfolio> }`
  - success message: "Portfolio created successfully."
  - error message: "We couldn't create the portfolio. Please review your inputs and try again." (fallback)

- `update`:
  - mutationFn: `updatePortfolio(api, id, data)`
  - variables: `{ id: string; data: Partial<Portfolio> }`
  - success message: "Portfolio updated successfully."
  - error message: "We couldn't update the portfolio. Please try again." (fallback)

- `remove`:
  - mutationFn: `deletePortfolio(api, id, workspace)`
  - variables: `{ id: string; workspace: string }`
  - success message: "Portfolio deleted successfully."
  - error message: "We couldn't delete the portfolio. Please try again." (fallback)

Return value:

## Returns

`object`

Returns an object with the three TanStack Query mutation results:
 - `create`: UseMutationResult<Portfolio, Error, CreatePortfolioProps, unknown>
 - `update`: UseMutationResult<Portfolio, Error, UpdatePortfolioProps, unknown>
 - `remove`: UseMutationResult<Portfolio, Error, DeletePortfolioProps, unknown>

Each mutation includes standard TanStack Query helpers:
- `mutate(variables, options?)`
- `mutateAsync(variables, options?)`
- `isPending`, `isSuccess`, `isError`, `error`, `data`, etc.

Examples:

1) Invalidate a portfolio list query after mutations:
```ts
const { create, update, remove } = usePortfolioMutations({ queryKey: ["portfolio"] });

 * // Create (minimal example - other Security fields omitted for brevity)
create.mutate({
  data: {
    name: "My Portfolio",
    description: "Test portfolio",
    base_currency: "USD",
    date: "2026-01-08",
    workspace: "ws-1",
    securities: [
      {
        id: "sec-1",
        ticker: "AAPL",
        symbol: "AAPL",
        name: "Apple Inc.",
        currency: "USD",
        quantity: 10,
        market_price: 200,
        market_value: 2000,
        market_value_in_base: 2000,
        fx_rate: 1,
        instrument_type: "Equity",
        instrument_class: "Equity",
        asset_class: "Equity",
        exchange: "NASDAQ",
        status: "active",
        // Other fields are nullable in the Security type and can be omitted here for documentation purposes.
      } as Security,
    ],
  }
});

// Update (partial)
update.mutate({
  id: "pf-123",
  data: {
    name: "Renamed Portfolio",
    tags: ["tag-1", "tag-2"],
    check_securities: true,
  }
});

// Delete
remove.mutate({ id: "pf-123", workspace: "ws-1" });
```

2) Using async/await with `mutateAsync`:
```ts
const { create } = usePortfolioMutations({ queryKey: ["portfolio"] });

await create.mutateAsync({
  data: {
    name: "My Portfolio",
    base_currency: "USD",
    date: "2026-01-08",
    workspace: "ws-1",
    securities: [],
  }
});
```

3) Without cache invalidation (no queryKey):
```ts
const { update } = usePortfolioMutations({});

update.mutate({
  id: "pf-123",
  data: { description: "Updated description" }
});
// Mutation still runs and alerts are shown, but cached queries are not invalidated.
```

4) Using `useFetchPortfolio` queryKey for automatic invalidation:
```ts
const fetch = useFetchPortfolio({
  id: null,
  filters: [{ field: "workspace", value: "ws-1" }],
});

const { remove } = usePortfolioMutations({ queryKey: fetch.queryKey });

await remove.mutateAsync({ id: "pf-123", workspace: "ws-1" });
```

### create

> **create**: `UseMutationResult`\<[`Portfolio`](../../../types/portfolio/type-aliases/Portfolio.md), `unknown`, `CreatePortfolioProps`, `unknown`\>

### remove

> **remove**: `UseMutationResult`\<[`Portfolio`](../../../types/portfolio/type-aliases/Portfolio.md), `unknown`, `DeletePortfolioProps`, `unknown`\>

### update

> **update**: `UseMutationResult`\<[`Portfolio`](../../../types/portfolio/type-aliases/Portfolio.md), `unknown`, `UpdatePortfolioProps`, `unknown`\>

---

<!-- api-md/hooks/useRunWorkflowMutations/functions/default.md -->

# Hook: useRunWorkflowMutations()
> **useRunWorkflowMutations**(): `object`

Defined in: `hooks/useRunWorkflowMutations.tsx:99`

useWorkflowMutations

Mutation hook built on TanStack Query to run Workflow executions:
- run a workflow asynchronously (POST /workflows/:id/run)
- run a workflow synchronously (POST /workflows/:id/run with `synchronous: true`)

It also:
- displays success/error alerts via `useAppAlert`

Important notes:
- Workflow execution is a side-effect operation, so it should be modeled as a mutation (not a query).
- `runSync` returns the execution response immediately. If you need the execution output/result,
  prefer `runSync` when available.
- `runAsync` may return an execution reference with a non-terminal status. If you need final output
  for async executions, you typically need an additional endpoint to poll execution status/result.

Mutations:
- `runAsync`:
  - mutationFn: `runWorkflow(api, id, workspace, parameters)`
  - variables: `{ id: string; workspace: string; parameters: DefaultObject }`
  - success message: "Workflow started successfully."
  - error message: "Unable to start the workflow. Please try again." (fallback)

- `runSync`:
  - mutationFn: `runWorkflowSync(api, id, workspace, parameters)`
  - variables: `{ id: string; workspace: string; parameters: DefaultObject }`
  - success message: "Workflow completed successfully."
  - error message: "Unable to run the workflow. Please try again." (fallback)

Return value:

## Returns

`object`

Returns an object with two TanStack Query mutation results:
 - `runAsync`: UseMutationResult<DefaultObject, Error, RunWorkflowProps, unknown>
 - `runSync`: UseMutationResult<DefaultObject, Error, RunWorkflowProps, unknown>

Each mutation includes standard TanStack Query helpers:
- `mutate(variables, options?)`
- `mutateAsync(variables, options?)`
- `isPending`, `isSuccess`, `isError`, `error`, `data`, etc.

Examples:

1) Start a workflow asynchronously:
```ts
const { runAsync } = useWorkflowMutations();

runAsync.mutate({
  id: "wf-123",
  workspace: "ws-1",
  parameters: { UID: "ABC123" },
});
```

2) Run a workflow synchronously and capture the result:
```ts
const { runSync } = useWorkflowMutations();

const result = await runSync.mutateAsync({
  id: "wf-123",
  workspace: "ws-1",
  parameters: { UID: "ABC123" },
});

console.log(result); // execution output/response
```

3) Custom behavior per call:
```ts
const { runSync } = useWorkflowMutations();

await runSync.mutateAsync(
  { id: "wf-123", workspace: "ws-1", parameters: {} },
  {
    onSuccess: (data) => {
      // e.g., route to a result page, open a dialog, etc.
    },
  }
);
```

### runAsync

> **runAsync**: `UseMutationResult`\<[`DefaultObject`](../../../types/defaultObject/type-aliases/DefaultObject.md), `Error`, `RunWorkflowProps`, `unknown`\>

### runSync

> **runSync**: `UseMutationResult`\<[`DefaultObject`](../../../types/defaultObject/type-aliases/DefaultObject.md), `Error`, `RunWorkflowProps`, `unknown`\>

---

<!-- api-md/utils/api/datastore/functions/deleteDatastore.md -->

# Function: deleteDatastore()

> **deleteDatastore**(`api`, `id`, `workspace`): `Promise`\<[`Datastore`](../../../../types/datastore/type-aliases/Datastore.md)\>

Defined in: `utils/api/datastore.ts:85`

## Parameters

### api

`AxiosInstance`

### id

`string`

### workspace

`string`

## Returns

`Promise`\<[`Datastore`](../../../../types/datastore/type-aliases/Datastore.md)\>

---

<!-- api-md/utils/api/datastore/functions/getDatastore.md -->

# Function: getDatastore()

> **getDatastore**(`api`, `id`, `workspace`): `Promise`\<[`Datastore`](../../../../types/datastore/type-aliases/Datastore.md)\>

Defined in: `utils/api/datastore.ts:8`

## Parameters

### api

`AxiosInstance`

### id

`string`

### workspace

`string`

## Returns

`Promise`\<[`Datastore`](../../../../types/datastore/type-aliases/Datastore.md)\>

---

<!-- api-md/utils/api/datastore/functions/getDatastores.md -->

# Function: getDatastores()

> **getDatastores**(`api`, `query`): `Promise`\<[`Datastore`](../../../../types/datastore/type-aliases/Datastore.md)[]\>

Defined in: `utils/api/datastore.ts:27`

## Parameters

### api

`AxiosInstance`

### query

[`DefaultObject`](../../../../types/defaultObject/type-aliases/DefaultObject.md)

## Returns

`Promise`\<[`Datastore`](../../../../types/datastore/type-aliases/Datastore.md)[]\>

---

<!-- api-md/utils/api/datastore/functions/postDatastore.md -->

# Function: postDatastore()

> **postDatastore**(`api`, `data`): `Promise`\<[`Datastore`](../../../../types/datastore/type-aliases/Datastore.md)\>

Defined in: `utils/api/datastore.ts:51`

## Parameters

### api

`AxiosInstance`

### data

`Partial`\<[`Datastore`](../../../../types/datastore/type-aliases/Datastore.md)\>

## Returns

`Promise`\<[`Datastore`](../../../../types/datastore/type-aliases/Datastore.md)\>

---

<!-- api-md/utils/api/datastore/functions/updateDatastore.md -->

# Function: updateDatastore()

> **updateDatastore**(`api`, `id`, `data`): `Promise`\<[`Datastore`](../../../../types/datastore/type-aliases/Datastore.md)\>

Defined in: `utils/api/datastore.ts:68`

## Parameters

### api

`AxiosInstance`

### id

`string`

### data

`Partial`\<[`Datastore`](../../../../types/datastore/type-aliases/Datastore.md)\>

## Returns

`Promise`\<[`Datastore`](../../../../types/datastore/type-aliases/Datastore.md)\>

---

<!-- api-md/utils/api/file/functions/deleteFile.md -->

# Function: deleteFile()

> **deleteFile**(`api`, `id`, `workspace`): `Promise`\<[`File`](../../../../types/file/type-aliases/File.md)\>

Defined in: `utils/api/file.ts:88`

## Parameters

### api

`AxiosInstance`

### id

`string`

### workspace

`string`

## Returns

`Promise`\<[`File`](../../../../types/file/type-aliases/File.md)\>

---

<!-- api-md/utils/api/file/functions/getFile.md -->

# Function: getFile()

> **getFile**(`api`, `id`, `workspace`): `Promise`\<[`File`](../../../../types/file/type-aliases/File.md)\>

Defined in: `utils/api/file.ts:9`

## Parameters

### api

`AxiosInstance`

### id

`string`

### workspace

`string`

## Returns

`Promise`\<[`File`](../../../../types/file/type-aliases/File.md)\>

---

<!-- api-md/utils/api/file/functions/getFiles.md -->

# Function: getFiles()

> **getFiles**(`api`, `query`): `Promise`\<[`File`](../../../../types/file/type-aliases/File.md)[]\>

Defined in: `utils/api/file.ts:28`

## Parameters

### api

`AxiosInstance`

### query

[`DefaultObject`](../../../../types/defaultObject/type-aliases/DefaultObject.md)

## Returns

`Promise`\<[`File`](../../../../types/file/type-aliases/File.md)[]\>

---

<!-- api-md/utils/api/file/functions/postFile.md -->

# Function: postFile()

> **postFile**(`api`, `data`): `Promise`\<[`File`](../../../../types/file/type-aliases/File.md)\>

Defined in: `utils/api/file.ts:54`

## Parameters

### api

`AxiosInstance`

### data

`Partial`\<[`File`](../../../../types/file/type-aliases/File.md)\>

## Returns

`Promise`\<[`File`](../../../../types/file/type-aliases/File.md)\>

---

<!-- api-md/utils/api/file/functions/updateFile.md -->

# Function: updateFile()

> **updateFile**(`api`, `id`, `data`): `Promise`\<[`File`](../../../../types/file/type-aliases/File.md)\>

Defined in: `utils/api/file.ts:71`

## Parameters

### api

`AxiosInstance`

### id

`string`

### data

`Partial`\<[`File`](../../../../types/file/type-aliases/File.md)\>

## Returns

`Promise`\<[`File`](../../../../types/file/type-aliases/File.md)\>

---

<!-- api-md/utils/api/portfolio/functions/deletePortfolio.md -->

# Function: deletePortfolio()

> **deletePortfolio**(`api`, `id`, `workspace`): `Promise`\<[`Portfolio`](../../../../types/portfolio/type-aliases/Portfolio.md)\>

Defined in: `utils/api/portfolio.ts:89`

## Parameters

### api

`AxiosInstance`

### id

`string`

### workspace

`string`

## Returns

`Promise`\<[`Portfolio`](../../../../types/portfolio/type-aliases/Portfolio.md)\>

---

<!-- api-md/utils/api/portfolio/functions/getPortfolio.md -->

# Function: getPortfolio()

> **getPortfolio**(`api`, `id`, `workspace`): `Promise`\<[`Portfolio`](../../../../types/portfolio/type-aliases/Portfolio.md)\>

Defined in: `utils/api/portfolio.ts:9`

## Parameters

### api

`AxiosInstance`

### id

`string`

### workspace

`string`

## Returns

`Promise`\<[`Portfolio`](../../../../types/portfolio/type-aliases/Portfolio.md)\>

---

<!-- api-md/utils/api/portfolio/functions/getPortfolios.md -->

# Function: getPortfolios()

> **getPortfolios**(`api`, `query`): `Promise`\<[`Portfolio`](../../../../types/portfolio/type-aliases/Portfolio.md)[]\>

Defined in: `utils/api/portfolio.ts:28`

## Parameters

### api

`AxiosInstance`

### query

[`DefaultObject`](../../../../types/defaultObject/type-aliases/DefaultObject.md)

## Returns

`Promise`\<[`Portfolio`](../../../../types/portfolio/type-aliases/Portfolio.md)[]\>

---

<!-- api-md/utils/api/portfolio/functions/postPortfolio.md -->

# Function: postPortfolio()

> **postPortfolio**(`api`, `data`): `Promise`\<[`Portfolio`](../../../../types/portfolio/type-aliases/Portfolio.md)\>

Defined in: `utils/api/portfolio.ts:55`

## Parameters

### api

`AxiosInstance`

### data

`Partial`\<[`Portfolio`](../../../../types/portfolio/type-aliases/Portfolio.md)\>

## Returns

`Promise`\<[`Portfolio`](../../../../types/portfolio/type-aliases/Portfolio.md)\>

---

<!-- api-md/utils/api/portfolio/functions/updatePortfolio.md -->

# Function: updatePortfolio()

> **updatePortfolio**(`api`, `id`, `data`): `Promise`\<[`Portfolio`](../../../../types/portfolio/type-aliases/Portfolio.md)\>

Defined in: `utils/api/portfolio.ts:72`

## Parameters

### api

`AxiosInstance`

### id

`string`

### data

`Partial`\<[`Portfolio`](../../../../types/portfolio/type-aliases/Portfolio.md)\>

## Returns

`Promise`\<[`Portfolio`](../../../../types/portfolio/type-aliases/Portfolio.md)\>

---

<!-- api-md/utils/api/workflow/functions/runWorkflow.md -->

# Function: runWorkflow()

> **runWorkflow**(`api`, `id`, `workspace`, `parameters`): `Promise`\<[`DefaultObject`](../../../../types/defaultObject/type-aliases/DefaultObject.md)\>

Defined in: `utils/api/workflow.ts:7`

## Parameters

### api

`AxiosInstance`

### id

`string`

### workspace

`string`

### parameters

[`DefaultObject`](../../../../types/defaultObject/type-aliases/DefaultObject.md)

## Returns

`Promise`\<[`DefaultObject`](../../../../types/defaultObject/type-aliases/DefaultObject.md)\>

---

<!-- api-md/utils/api/workflow/functions/runWorkflowSync.md -->

# Function: runWorkflowSync()

> **runWorkflowSync**(`api`, `id`, `workspace`, `parameters`): `Promise`\<[`DefaultObject`](../../../../types/defaultObject/type-aliases/DefaultObject.md)\>

Defined in: `utils/api/workflow.ts:34`

## Parameters

### api

`AxiosInstance`

### id

`string`

### workspace

`string`

### parameters

[`DefaultObject`](../../../../types/defaultObject/type-aliases/DefaultObject.md)

## Returns

`Promise`\<[`DefaultObject`](../../../../types/defaultObject/type-aliases/DefaultObject.md)\>

---

<!-- api-md/utils/apiQuery/functions/buildApiQueryParams.md -->

# Function: buildApiQueryParams()

> **buildApiQueryParams**(`params`): [`DefaultObject`](../../../types/defaultObject/type-aliases/DefaultObject.md)

Defined in: `utils/apiQuery.ts:61`

Builds the API query parameter object from strongly typed query params.

Responsibilities:
- Converts `filters` from object form into tuple-based expressions using `serializeFilter`.
- Uses API naming conventions for pagination keys:
  - pageSize   -> page_size
  - pageToken  -> page_token
- Omits `projection` when it is empty/falsy.

## Parameters

### params

[`EntityQueryParams`](../../../types/entityQuery/interfaces/EntityQueryParams.md)

Query parameters used for entity list/search endpoints.

## Returns

[`DefaultObject`](../../../types/defaultObject/type-aliases/DefaultObject.md)

A plain object suitable to be used as query params (e.g., Axios `params`).

## Example

```ts
const apiParams = buildApiQueryParams({
  filters: [{ field: "workspace", value: "acme" }],
  order: ["created desc"],
  pageSize: 50,
  pageToken: "next",
  projection: "-name",
});
// {
//   filters: [["workspace", "acme"]],
//   order: ["created desc"],
//   projection: "id,name",
//   page_size: 50,
//   page_token: "next",
// }
```

---

<!-- api-md/utils/apiQuery/functions/serializeFilter.md -->

# Function: serializeFilter()

> **serializeFilter**(`filter`): [`FilterExpression`](../../../types/entityQuery/type-aliases/FilterExpression.md)

Defined in: `utils/apiQuery.ts:22`

Serializes a filter clause into the tuple-based filter expression expected by the API.

The API supports two formats:
- [field, value] when the operator is omitted or equals "="
- [field, operator, value] when an explicit operator is provided and is not "="

## Parameters

### filter

[`FilterClause`](../../../types/entityQuery/interfaces/FilterClause.md)

A filter clause in object form ({ field, op?, value }).

## Returns

[`FilterExpression`](../../../types/entityQuery/type-aliases/FilterExpression.md)

A tuple-based filter expression to be sent to the API.

## Examples

```ts
serializeFilter({ field: "workspace", value: "acme" });
// ["workspace", "acme"]
```

```ts
serializeFilter({ field: "created", op: ">=", value: "2025-01-01" });
// ["created", ">=", "2025-01-01"]
```

---

<!-- api-md/utils/datastore/functions/datastoreToObject.md -->

# Function: datastoreToObject()

> **datastoreToObject**\<`T`\>(`datastoreId`, `headers`, `data`): `T`[]

Defined in: `utils/datastore.ts:42`

Converts a datastore table (2D array) into an array of objects.

The input `data` is expected to be a 2D array where:
- Row 0 typically contains the headers (but headers are provided explicitly via `headers`)
- Rows 1..N contain the data values

Key behaviors:
- Skips the first row of `data` (starts at index 1), assuming it is the header row.
- Adds a `datastoreId` field to every generated object so each record can be traced
  back to its source datastore.
- Maps each header to the corresponding cell value by column index.

## Type Parameters

### T

`T` *extends* `Record`\<`string`, `Cell`\>

A record type whose values are compatible with `Cell` (string | number | null).

## Parameters

### datastoreId

`string`

The id of the datastore to attach to each row as `datastoreId`.

### headers

`string`[]

The column names used as object keys (positionally aligned with row cells).

### data

`Datastore`

The datastore matrix (rows x columns). Row 0 is assumed to be headers.

## Returns

`T`[]

An array of objects (one per data row), each containing:
- `datastoreId`
- one property per header (with the corresponding cell value)

## Example

```ts
const headers = ["name", "age"];
const data = [
  ["name", "age"],
  ["Alice", 30],
  ["Bob", null],
];
const rows = datastoreToObject("ds_123", headers, data);
// [
//   { datastoreId: "ds_123", name: "Alice", age: 30 },
//   { datastoreId: "ds_123", name: "Bob", age: null }
// ]
```

---

<!-- api-md/utils/datastore/functions/mergeDatastores.md -->

# Function: mergeDatastores()

> **mergeDatastores**(`datastores`): [`DefaultObject`](../../../types/defaultObject/type-aliases/DefaultObject.md)[]

Defined in: `utils/datastore.ts:112`

Flattens multiple datastore row arrays into a single array.

This is typically used after fetching multiple datastores, where each datastore is
represented as `DefaultObject[]` (i.e., an array of row objects).

## Parameters

### datastores

[`DefaultObject`](../../../types/defaultObject/type-aliases/DefaultObject.md)[][]

A list of datastores, each represented as an array of row objects.

## Returns

[`DefaultObject`](../../../types/defaultObject/type-aliases/DefaultObject.md)[]

A single array containing all rows from all datastores, in the same order.

## Example

```ts
const merged = mergeDatastores([
  [{ datastoreId: "a", x: 1 }],
  [{ datastoreId: "b", x: 2 }, { datastoreId: "b", x: 3 }],
]);
// [{...}, {...}, {...}]
```

---

<!-- api-md/utils/datastore/functions/objectToDatastore.md -->

# Function: objectToDatastore()

> **objectToDatastore**\<`T`\>(`headers`, `data`): `Datastore`

Defined in: `utils/datastore.ts:89`

Converts an array of objects into a datastore table (2D array).

Key behaviors:
- Produces a 2D array where the first row is the provided `headers`.
- For each object in `data`, creates a row by mapping `headers` to values in the object.
- If a header is missing in an object, the corresponding cell is set to `null`.

## Type Parameters

### T

`T` *extends* `Record`\<`string`, `Cell`\>

A record type whose values are compatible with `Cell` (string | number | null).

## Parameters

### headers

`string`[]

Column names (and output table header row).

### data

`T`[]

Array of objects to convert into rows.

## Returns

`Datastore`

A datastore matrix where:
- Row 0 is `headers`
- Rows 1..N contain cell values aligned with `headers`

## Example

```ts
const headers = ["name", "age"];
const rows = objectToDatastore(headers, [
  { name: "Alice", age: 30 },
  { name: "Bob" }, // age missing -> null
]);
// [
//   ["name", "age"],
//   ["Alice", 30],
//   ["Bob", null]
// ]
```

---

<!-- api-md/utils/queryClient/variables/getQueryFn.md -->

# Variable: getQueryFn()

> `const` **getQueryFn**: \<`T`\>(`options`) => `QueryFunction`\<`T`\>

Defined in: `utils/queryClient.ts:11`

## Parameters

### options

#### on401

`UnauthorizedBehavior`

## Returns

`QueryFunction`\<`T`\>

---

<!-- api-md/utils/queryClient/variables/queryClient.md -->

# Variable: queryClient

> `const` **queryClient**: `QueryClient`

Defined in: `utils/queryClient.ts:28`