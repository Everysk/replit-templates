---
name: everysk-utils
description: Built-in hooks and providers for this template. Use before writing any data-fetching, mutation, or broadcast logic. Covers all Everysk entity hooks (portfolio, datastore, file, workflow, workspace), broadcast channel utilities, and context providers. MANDATORY: load this skill before implementing any feature that reads or writes Everysk entities, listens to broadcast messages, or needs app config/alerts.
---

# Everysk Template — Built-in Hooks & Providers

This template ships with ready-made hooks and providers for every common operation.
**Do not create custom fetch utilities, axios calls, or BroadcastChannel instances — use what already exists.**

## The Core Rule

Before writing any data-fetching, mutation, or messaging code, check this skill first.
If a hook already exists for the operation — use it. Creating a duplicate causes cache inconsistency, stale data, and broken broadcasts.

---

## Anti-Patterns — Never Do These

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `axios.get("/portfolios")` | `useFetchPortfolios({ filters })` |
| `axios.post("/datastores")` | `useDatastoreMutations({ queryKey })` |
| `new BroadcastChannel("everysk")` | `useBroadcastChannel()` or `useBroadcastSubscription()` |
| Custom `useEffect` + `axios` to fetch a workflow | `useFetchWorkflow({ id, workspace })` |
| Custom `useState` + `fetch` for files | `useFetchFile({ id, workspace })` |
| Manual `LicenseManager.setLicenseKey(...)` | `<AgGridLicenseProvider>` |
| `response.someValue` after `runSync.mutateAsync(...)` | `response.result.data.someValue` |
| `response.result.someValue` after `runSync.mutateAsync(...)` | `response.result.data.someValue` |

---

## Broadcast Channel — Critical Rule

The app communicates with the Everysk parent frame via a **single shared BroadcastChannel**.
Creating a `new BroadcastChannel(...)` directly bypasses the shared channel and the messages will never be received.

**Always use the provided hooks:**

```ts
// Subscribe to messages
useBroadcastSubscription((msg) => {
  if (msg.type === "MY_EVENT") handleIt(msg.payload);
});

// Or manually subscribe/unsubscribe
const { subscribe, post } = useBroadcastChannel();
useEffect(() => {
  const unsub = subscribe((msg) => { ... });
  return unsub;
}, [subscribe]);

// Send a message
const { post } = useBroadcastChannel();
post({ type: "MY_EVENT", payload: { ... } });
```

`useBroadcastChannel()` — `src/hooks/useBroadcastChannel.tsx` — requires `<BroadcastChannelProvider>` ancestor.
`useBroadcastSubscription(handler)` — `src/hooks/useBroadcastSubscription.tsx` — higher-level: handles subscribe/unsubscribe lifecycle automatically.

---

## Entity Hooks — Quick Reference

All hooks require the relevant providers in the tree (`QueryClientProvider`, `AppAlertProvider`, `BroadcastChannelProvider`). See Providers section below.

### Portfolio — `src/hooks/portfolio/`

**`useFetchPortfolio({ id, workspace, queryOptions? })`**
Fetch a single portfolio. Returns `{ data: Portfolio, isLoading, queryKey, ... }`.
```ts
const { data, isLoading, queryKey } = useFetchPortfolio({ id: "pf-123", workspace: "ws-1" });
```

**`useFetchPortfolios({ filters?, order?, projection?, pageSize?, queryOptions? })`**
Paginated list. Returns `{ query, queryKey }`. `query.data` is flat `Portfolio[]`.
```ts
const { query } = useFetchPortfolios({ filters: [{ field: "workspace", value: "ws-1" }] });
const portfolios = query.data ?? [];
```

**`usePortfolioMutations({ queryKey? })`**
Returns `{ create, update, remove }`. Auto-invalidates `queryKey` on success. Shows alerts.
```ts
const { create, update, remove } = usePortfolioMutations({ queryKey });
create.mutate({ data: { name: "My Portfolio", base_currency: "USD", date: "2026-01-08", workspace: "ws-1", securities: [] } });
update.mutate({ id: "pf-123", data: { name: "Renamed" } });
remove.mutate({ id: "pf-123", workspace: "ws-1" });
```

---

### Datastore — `src/hooks/datastore/`

**`useFetchDatastore({ id, workspace, queryOptions? })`**
Fetch a single datastore. Returns `DatastoreWithRows` — rows as `DefaultObject[]`.
```ts
const { data, queryKey } = useFetchDatastore({ id: "ds-123", workspace: "ws-1" });
// data.data -> [{ datastoreId: "ds-123", col1: "value", ... }]
```

**`useFetchDatastores({ filters?, order?, projection?, pageSize?, queryOptions? })`**
Paginated list. `query.data` is flat `DatastoreWithRows[]`.
```ts
const { query } = useFetchDatastores({ filters: [{ field: "workspace", value: "ws-1" }] });
const datastores = query.data ?? [];
```

**`useDatastoreMutations({ queryKey? })`**
Returns `{ create, update, remove }`. `data.data` format: `[["col1","col2"],["val1","val2"]]`.
```ts
const { create, update, remove } = useDatastoreMutations({ queryKey });
create.mutate({ data: { name: "My DS", workspace: "ws-1", data: [["id","name"],["001","Alice"]] } });
remove.mutate({ id: "ds-123", workspace: "ws-1" });
```

---

### File — `src/hooks/file/`

**`useFetchFile({ id, workspace, queryOptions? })`**
Fetch a single file. `data.data` is Base64-encoded content.
```ts
const { data, queryKey } = useFetchFile({ id: "file-123", workspace: "ws-1" });
```

**`useFetchFiles({ filters?, order?, projection?, pageSize?, queryOptions? })`**
Paginated list. `query.data` is flat `File[]`.
```ts
const { query } = useFetchFiles({ filters: [{ field: "workspace", value: "ws-1" }] });
```

**`useFileMutations({ queryKey? })`**
Returns `{ create, update, remove }`. File content must be raw Base64 (no `data:<mime>;base64,` prefix).
```ts
const { create } = useFileMutations({ queryKey });
create.mutate({ data: { name: "report.txt", workspace: "ws-1", content_type: "text/plain", version: "1", link_uid: null, data: "SGVsbG8=" } });
```

---

### Workflow — `src/hooks/workflow/`

**`useFetchWorkflow({ id, workspace, queryOptions? })`**
Fetch a single workflow.
```ts
const { data } = useFetchWorkflow({ id: "wf-123", workspace: "ws-1" });
```

**`useFetchWorkflows({ workspace?, pageSize?, queryOptions? })`**
Paginated list. `workspace` sent as direct query param (not inside a filter).
```ts
const { query } = useFetchWorkflows({ workspace: "ws-1" });
const workflows = query.data ?? [];
```

**`useWorkflowRunMutations()`**
Returns `{ runAsync, runSync }`.
- **`runSync`** — waits for the workflow to finish and returns the full response including `result.data`. Use this when you need the output.
- **`runAsync`** — fires the workflow and returns immediately without waiting. `result.data` will be empty or absent — do not try to read output from it.

**Response shape:**
```json
{
  "workflow_execution": {
    "id": "wfex_...",
    "status": "COMPLETED",
    "run_status": "SUCCEEDED",
    "workflow_id": "wrkf_...",
    "workflow_name": "...",
    "workspace": "...",
    "duration": 15.78,
    "started": 1777316506,
    "resume": [ /* array of worker execution summaries */ ]
  },
  "result": {
    "log": [],
    "status": "OK",
    "data": { /* workflow-specific output — different for every workflow */ }
  }
}
```

- `response.workflow_execution` — execution metadata (status, duration, worker trace via `resume`)
- `response.result.status` — `"OK"` on success
- `response.result.data` — **the actual output values, defined by each workflow's Ender worker**

```ts
const { runSync } = useWorkflowRunMutations();
const response = await runSync.mutateAsync({ id: "wf-123", workspace: "ws-1", parameters: { UID: "ABC" } });

// ✅ Correct — workflow output lives in response.result.data
const output = response.result.data;
console.log(output.summary); // e.g. [["Issuer", "Notional", ...], [...]]

// ❌ Wrong — these are always undefined
console.log(response.summary);               // undefined — not at top level
console.log(response.result.summary);        // undefined — data is one level deeper
```

**`useFetchWorkflowExecution({ workflowId, workflowExecutionId, workspace, queryOptions? })`**
```ts
const { data } = useFetchWorkflowExecution({ workflowId: "wf-123", workflowExecutionId: "exec-456", workspace: "main" });
```

**`useFetchWorkflowExecutions({ workflowId, filters?, order?, projection?, pageSize?, queryOptions? })`**
`filters` must include a `workspace` filter.
```ts
const { query } = useFetchWorkflowExecutions({ workflowId: "wf-123", filters: [{ field: "workspace", value: "main" }] });
```

**`useFetchWorkerExecution({ workflowId, workerExecutionId, workspace, queryOptions? })`**
```ts
const { data } = useFetchWorkerExecution({ workflowId: "wf-123", workerExecutionId: "wkex-456", workspace: "main" });
```

**`useFetchWorkerExecutions({ workflowId, workflowExecutionId, filters?, order?, projection?, pageSize?, queryOptions? })`**
```ts
const { query } = useFetchWorkerExecutions({ workflowId: "wf-123", workflowExecutionId: "wfex-456", filters: [{ field: "workspace", value: "main" }] });
```

---

### Workspace — `src/hooks/workspaces/`

**`useFetchWorkspace({ name, queryOptions? })`**
```ts
const { data } = useFetchWorkspace({ name: "main" });
```

**`useFetchWorkspaces({ workspace?, pageSize?, queryOptions? })`**
```ts
const { query } = useFetchWorkspaces({ workspace: "main" });
const workspaces = query.data ?? [];
```

---

## Filters, Order & Projection

### FilterClause — the filter object

All list hooks accept `filters: FilterClause[]`. Each clause has:

```ts
{ field: string; value: unknown; op?: "=" | ">" | ">=" | "<" | "<=" | "!=" }
```

`op` is optional — omitting it means equality (`=`).

### Operators

| op | Meaning | Example |
|----|---------|---------|
| *(omitted)* or `"="` | equals | `{ field: "workspace", value: "ws-1" }` |
| `"!="` | not equals | `{ field: "status", op: "!=", value: "DELETED" }` |
| `">"` | greater than | `{ field: "created", op: ">", value: 1700000000 }` |
| `">="` | greater than or equal | `{ field: "date", op: ">=", value: "20260101" }` |
| `"<"` | less than | `{ field: "created", op: "<", value: 1800000000 }` |
| `"<="` | less than or equal | `{ field: "date", op: "<=", value: "20261231" }` |

### Common fields

| Field | Type | Notes |
|-------|------|-------|
| `workspace` | `string` | **Always required** as the first filter in every list hook |
| `name` | `string` | Exact name match |
| `date` | `string` | Format `"YYYYMMDD"` (e.g. `"20260115"`) — supports range operators |
| `link_uid` | `string` | Links the entity to a specific UID (e.g. a datastore linked to a portfolio) |
| `tags` | `string` | Filter by tag value |

### Examples

```ts
// workspace only (minimum required)
const filters: FilterClause[] = [
  { field: "workspace", value: "ws-1" },
];

// filter by name
const filters: FilterClause[] = [
  { field: "workspace", value: "ws-1" },
  { field: "name", value: "My Portfolio" },
];

// filter by date range (format: "YYYYMMDD")
const filters: FilterClause[] = [
  { field: "workspace", value: "ws-1" },
  { field: "date", op: ">=", value: "20260101" },
  { field: "date", op: "<=", value: "20261231" },
];

// filter by link_uid (e.g. datastores linked to a specific portfolio)
const filters: FilterClause[] = [
  { field: "workspace", value: "ws-1" },
  { field: "link_uid", value: "pf-abc123" },
];

// filter by tag
const filters: FilterClause[] = [
  { field: "workspace", value: "ws-1" },
  { field: "tags", value: "risk" },
];

// combining multiple common fields
const filters: FilterClause[] = [
  { field: "workspace", value: "ws-1" },
  { field: "link_uid", value: "pf-abc123" },
  { field: "date", op: ">=", value: "20260101" },
  { field: "date", op: "<=", value: "20261231" },
];
```

### Filter values must come from app config — never hardcoded

Values like `workspace`, `link_uid`, tag IDs, and other entity identifiers are **runtime configuration** — they differ between environments and deployments. Always store them in `dev/app-config.dev.json` and read them via `useAppConfig()`.

**`dev/app-config.dev.json`** — add your config values here:
```json
{
  "app": "my-everysk-app",
  "workspace": "my-workspace",
  "link_uid": "pf-abc123",
  "tags": ["risk", "equity"]
}
```

**Component** — read via `useAppConfig()` and pass to filters:
```ts
const { appEnvironmentVar } = useAppConfig();

const workspace = appEnvironmentVar.workspace as string;
const linkUid = appEnvironmentVar.link_uid as string;

const filters: FilterClause[] = [
  { field: "workspace", value: workspace },
  { field: "link_uid", value: linkUid },
];

const { query } = useFetchDatastores({ filters });
```

```ts
// ❌ Never hardcode — breaks when deployed to a different environment
const filters = [
  { field: "workspace", value: "my-workspace" },
  { field: "link_uid", value: "pf-abc123" },
];

// ✅ Always read from appEnvironmentVar
const { appEnvironmentVar } = useAppConfig();
const filters = [
  { field: "workspace", value: appEnvironmentVar.workspace as string },
  { field: "link_uid", value: appEnvironmentVar.link_uid as string },
];
```

In production, `window.APP_CONFIG` is injected by the Everysk server using the values from `dev/app-config.dev.json` sent during deploy — so the same code works in both environments without changes.

---

### Workspace filter is mandatory

Every list hook (`useFetchPortfolios`, `useFetchDatastores`, `useFetchFiles`, `useFetchWorkflowExecutions`, `useFetchWorkerExecutions`) **requires** a `workspace` filter. Omitting it will return no results or cause an API error.

```ts
// ❌ Missing workspace — will not work
const filters = [{ field: "status", value: "ACTIVE" }];

// ✅ Always include workspace first
const filters = [
  { field: "workspace", value: "ws-1" },
  { field: "status", value: "ACTIVE" },
];
```

### order — sorting

`order` is an array of strings in the format `"field direction"`:

```ts
order: ["created desc"]        // newest first
order: ["name asc"]            // alphabetical
order: ["date desc", "name asc"] // multiple sort fields
```

### projection — field exclusion

`projection` is a single field name string that tells the API to **exclude** that field from the response. Use it to avoid fetching large fields you don't need (e.g. `data` on a datastore).

```ts
projection: "data"   // exclude the data field — useful when you only need metadata
projection: ""       // omit — returns all fields (default)
```

---

## Pagination — Infinite Query Pattern

All list hooks (`useFetchPortfolios`, `useFetchDatastores`, `useFetchFiles`, `useFetchWorkflows`, `useFetchWorkflowExecutions`, `useFetchWorkerExecutions`, `useFetchWorkspaces`) use `useInfiniteQuery`. Use `query.hasNextPage` and `query.fetchNextPage` to load more:

```ts
const { query } = useFetchPortfolios({ filters: [{ field: "workspace", value: "ws-1" }] });

const portfolios = query.data ?? [];
const canLoadMore = query.hasNextPage && !query.isFetchingNextPage;

// Load next page (e.g. on scroll or button click)
query.fetchNextPage();
```

---

## Utility Hooks

**`useAxios()`** — `src/hooks/useAxios.tsx`
Returns `{ api }`: memoized Axios instance with `baseURL=/api`. Do not create your own Axios instance.
```ts
const { api } = useAxios();
api.get("/some-endpoint").then(res => console.log(res.data));
```

**`useAppAlert()`** — `src/hooks/useAppAlert.tsx`
Returns `{ showAlert(options), hideAlert() }`. Use for success/error feedback — do not use `alert()` or custom toast libraries.
```ts
const { showAlert } = useAppAlert();
showAlert({ message: "Saved.", severity: "success", autoHideDuration: 3000 });
```

**`useAppConfig()`** — `src/hooks/useAppConfig.tsx`
Returns `{ appId, appEnvironmentVar }`. Use to read runtime config — do not read `window.APP_CONFIG` directly.
```ts
const { appId, appEnvironmentVar } = useAppConfig();
```

---

## GlobalLoading Component

Use `GlobalLoading` for any loading state — do not create custom spinners.

**Props:** `isLoading: boolean`, `backdrop?: boolean` (default `true`), `message?: string`

- `backdrop={true}` — full-screen MUI `Backdrop` with semi-transparent overlay (default)
- `backdrop={false}` — centered spinner inside its container, no overlay

```tsx
import GlobalLoading from "src/components/GlobalLoading";

// Full-screen overlay while loading
<GlobalLoading isLoading={isLoading} message="Loading data..." />

// Inline, no backdrop
<GlobalLoading isLoading={isLoading} backdrop={false} message="Fetching..." />

// Conditionally shown (returns null when isLoading=false)
<GlobalLoading isLoading={query.isLoading} />
```

---

## Broadcast Message Format

All messages must follow `{ type: string; payload?: T }`. The `payload` is optional.

```ts
// Sending
const { post } = useBroadcastChannel();
post({ type: "MY_EVENT", payload: { id: "123", value: 42 } });
post({ type: "PING" }); // payload is optional

// Receiving
useBroadcastSubscription((msg) => {
  if (msg.type === "MY_EVENT") {
    const { id, value } = msg.payload as { id: string; value: number };
  }
});
```

Do not invent message types that the shell does not send. Known shell → app messages:
- `SEND_AG_GRID_LICENSE` — `{ license: string }` — AG Grid license key (handled by `AgGridLicenseProvider`)

---

## Providers — Required Nesting Order

```tsx
<ThemeProviderWrapper>           {/* outermost — MUI theme for all components */}
  <BroadcastChannelProvider>     {/* cross-tab messaging */}
    <AppConfigProvider>          {/* runtime config */}
      <QueryClientProvider client={queryClient}>   {/* TanStack Query */}
        <AppAlertProvider>       {/* global alerts */}
          {/* your app */}
        </AppAlertProvider>
      </QueryClientProvider>
    </AppConfigProvider>
  </BroadcastChannelProvider>
</ThemeProviderWrapper>
```

**Never** re-create these providers or instantiate their underlying primitives directly.

---

## Optional Provider — AgGridLicenseProvider

> Requires `npm install ag-grid-enterprise` before use.

Manages the AG Grid Enterprise license via broadcast channel. Wrap only the subtree that uses AG Grid Enterprise.

```tsx
// Install first: npm install ag-grid-enterprise
import { AgGridLicenseProvider } from "./contexts/agGridLicenseContext/agGridLicenseProvider";

<ThemeProviderWrapper>
  <BroadcastChannelProvider>       {/* AgGridLicenseProvider must be inside this */}
    <AppConfigProvider>
      <QueryClientProvider client={queryClient}>
        <AppAlertProvider>
          <AgGridLicenseProvider>  {/* wrap only the subtree that uses AG Grid */}
            <MyAgGridPage />
          </AgGridLicenseProvider>
        </AppAlertProvider>
      </QueryClientProvider>
    </AppConfigProvider>
  </BroadcastChannelProvider>
</ThemeProviderWrapper>
```

Without the package installed, children render normally with no license errors.
