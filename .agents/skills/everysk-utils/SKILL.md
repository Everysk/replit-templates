---
name: everysk-utils
description: Built-in hooks and providers for this template. Use before writing any data-fetching, mutation, or broadcast logic. Covers all Everysk entity hooks (portfolio, datastore, file, workflow, workspace), broadcast channel utilities, and context providers. MANDATORY: load this skill before implementing any feature that reads or writes Everysk entities, listens to broadcast messages, or needs app config/alerts. Environment-specific filter values (workspace, link_uid, fixed tags) must come from useAppConfig(), never hardcoded. Dynamic values (dates, status, user input) come from component state.
---

# Everysk Template — Built-in Hooks & Providers

This template ships with ready-made hooks and providers for every common operation.
**Do not create custom fetch utilities, axios calls, or BroadcastChannel instances — use what already exists.**

## The Core Rule

Before writing any data-fetching, mutation, or messaging code, check this skill first.
If a hook already exists for the operation — use it. Creating a duplicate causes cache inconsistency, stale data, and broken broadcasts.

---

## ⛔ Filter Values — Know the Source

Not all filter values are equal. Use the right source for each:

| Filter field | Source | Why |
|---|---|---|
| `workspace` | `useAppConfig()` → `appEnvironmentVar.workspace` | Environment-specific — differs per deployment |
| `link_uid` | `useAppConfig()` → `appEnvironmentVar.link_uid` | Configured per app instance |
| `tags` (app scope) | `useAppConfig()` → `appEnvironmentVar.tags` | App always scoped to these tags — configured per instance |
| `tags` (user-selected) | Component state / props | User picks a tag from a dropdown — dynamic |
| `date`, `date_time` | Component state / props / calculated | Dynamic — changes per user interaction |
| `status`, `name`, etc. | Component state / props / user input | Dynamic — driven by UI |

When the user picks a tag from a dropdown, that is a **dynamic** value — it comes from state, not config:

```ts
const [selectedTag, setSelectedTag] = useState<string>("");
const filters: FilterClause[] = [
  { field: "workspace", value: workspace },   // config
  { field: "tags", value: selectedTag },      // user-selected — state
];
```

**Config values** (`workspace`, `link_uid`, fixed `tags`): store in `dev/app-config.dev.json`, read via `useAppConfig()`. Hardcoding them breaks silently when deployed to a different environment.

```json
{
  "app": "my-everysk-app",
  "workspace": "my-workspace",
  "link_uid": "pf-abc123",
  "tags": ["risk", "equity"]
}
```

> If the app needs multiple workspaces or tag sets, use semantic keys (e.g. `main_workspace`, `trades_workspace`, `trades_tag`) instead of a single `workspace` key — then read them individually via `appEnvironmentVar.main_workspace`.

```ts
const { appEnvironmentVar } = useAppConfig();
const workspace = appEnvironmentVar.workspace as string;
const linkUid = appEnvironmentVar.link_uid as string;
// Use a named key when possible (e.g. "equity_tag") — avoid [0] if the array has multiple values
const tag = (appEnvironmentVar.tags as string[])[0];

// Dynamic values come from state/props — NOT from app config
const [startDate, setStartDate] = useState("20260101");
const [endDate, setEndDate] = useState("20261231");

const filters: FilterClause[] = [
  { field: "workspace", value: workspace },       // from config
  { field: "link_uid", value: linkUid },          // from config
  { field: "tags", value: tag },                  // from config
  { field: "date", op: ">=", value: startDate },  // dynamic
  { field: "date", op: "<=", value: endDate },    // dynamic
];
```

```ts
// ❌ Never hardcode config values — breaks on deploy
{ field: "workspace", value: "my-workspace" }
{ field: "link_uid", value: "pf-abc123" }

// ✅ Config values from useAppConfig(), dynamic values from state
{ field: "workspace", value: appEnvironmentVar.workspace as string }
{ field: "date", op: ">=", value: startDate }  // fine as state
```

In production, `window.APP_CONFIG` is injected by the Everysk server using `dev/app-config.dev.json` values sent during deploy — the same code works in both environments without changes.

### When the source is unclear — ask

The table covers obvious cases, but some values are genuinely ambiguous:

| Value | Ambiguity |
|---|---|
| `status: "ACTIVE"` | Fixed UI behavior (constant) vs. user-picked (state) vs. per-deploy (config)? |
| `link_uid` of a specific portfolio | App's main portfolio (config) or user-selected one (state)? |
| Date range "last 30 days" | Calculated dynamic, configurable default, or user-controlled? |
| A tag like `"trade"` | App scope — always this tag (config) or a variable page filter (state)? |

When surrounding code or product context doesn't make the source obvious, **ask before persisting the value anywhere**:

> "Where should `<value>` come from — `useAppConfig()` (environment-specific, set per deploy), component state (dynamic / user-controlled), or hardcoded (true app constant)?"

**You do not need to ask about the key name.** Pick a clear semantic name (`main_portfolio_uid`, `default_status_filter`, etc.) and add it to `dev/app-config.dev.json`. Only the **source decision** needs user input.

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
| `workspace: "my-workspace"` or hardcoded `link_uid`/`tags` | `workspace: appEnvironmentVar.workspace` from `useAppConfig()` — dates and dynamic values are fine as state |

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
`useBroadcastSubscription(handler)` — `src/hooks/useBroadcastSubscription/index.tsx` — higher-level: handles subscribe/unsubscribe lifecycle automatically.

---

## Entity Hooks — Quick Reference

All hooks require the relevant providers in the tree (`QueryClientProvider`, `AppAlertProvider`, `BroadcastChannelProvider`). See Providers section below.

> **In all examples below:** `workspace` is a variable from `useAppConfig()` — never a string literal. See "⛔ Filter Values — Know the Source" above.

### Portfolio — `src/hooks/portfolio/`

**`useFetchPortfolio({ id, workspace, queryOptions? })`**
Fetch a single portfolio. Returns `{ data: Portfolio, isLoading, queryKey, ... }`.
```ts
const { data, isLoading, queryKey } = useFetchPortfolio({ id: "pf-123", workspace });
```

**`useFetchPortfolios({ filters?, order?, projection?, pageSize?, queryOptions? })`**
Paginated list. Returns `{ query, queryKey }`. `query.data` is flat `Portfolio[]`.
```ts
const { query } = useFetchPortfolios({ filters: [{ field: "workspace", value: workspace }] });
const portfolios = query.data ?? [];
```

**`usePortfolioMutations({ queryKey? })`**
Returns `{ create, update, remove }`. Auto-invalidates `queryKey` on success. Shows alerts.
```ts
const { create, update, remove } = usePortfolioMutations({ queryKey });
create.mutate({ data: { name: "My Portfolio", base_currency: "USD", date: "2026-01-08", workspace, securities: [] } });
update.mutate({ id: "pf-123", data: { name: "Renamed" } });
remove.mutate({ id: "pf-123", workspace });
```

---

### Datastore — `src/hooks/datastore/`

**`useFetchDatastore({ id, workspace, queryOptions? })`**
Fetch a single datastore. Returns `DatastoreWithRows` — rows as `DefaultObject[]`.
```ts
const { data, queryKey } = useFetchDatastore({ id: "ds-123", workspace });
// data.data -> [{ datastoreId: "ds-123", col1: "value", ... }]
```

**`useFetchDatastores({ filters?, order?, projection?, pageSize?, queryOptions? })`**
Paginated list. `query.data` is flat `DatastoreWithRows[]`.
```ts
const { query } = useFetchDatastores({ filters: [{ field: "workspace", value: workspace }] });
const datastores = query.data ?? [];
```

**`useDatastoreMutations({ queryKey? })`**
Returns `{ create, update, remove }`. `data.data` format: `[["col1","col2"],["val1","val2"]]`.
```ts
const { create, update, remove } = useDatastoreMutations({ queryKey });
create.mutate({ data: { name: "My DS", workspace, data: [["id","name"],["001","Alice"]] } });
remove.mutate({ id: "ds-123", workspace });
```

---

### File — `src/hooks/file/`

**`useFetchFile({ id, workspace, queryOptions? })`**
Fetch a single file. `data.data` is Base64-encoded content.
```ts
const { data, queryKey } = useFetchFile({ id: "file-123", workspace });
```

**`useFetchFiles({ filters?, order?, projection?, pageSize?, queryOptions? })`**
Paginated list. `query.data` is flat `File[]`.
```ts
const { query } = useFetchFiles({ filters: [{ field: "workspace", value: workspace }] });
```

**`useFileMutations({ queryKey? })`**
Returns `{ create, update, remove }`. File content must be raw Base64 (no `data:<mime>;base64,` prefix).
```ts
const { create } = useFileMutations({ queryKey });
create.mutate({ data: { name: "report.txt", workspace, content_type: "text/plain", version: "1", link_uid: null, data: "SGVsbG8=" } });
```

---

### Workflow — `src/hooks/workflow/`

**`useFetchWorkflow({ id, workspace, queryOptions? })`**
Fetch a single workflow.
```ts
const { data } = useFetchWorkflow({ id: "wf-123", workspace });
```

**`useFetchWorkflows({ workspace?, pageSize?, queryOptions? })`**
Paginated list. `workspace` sent as direct query param (not inside a filter).
```ts
const { query } = useFetchWorkflows({ workspace });
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
const response = await runSync.mutateAsync({ id: "wf-123", workspace, parameters: { UID: "ABC" } });

// ✅ Correct — workflow output lives in response.result.data
const output = response.result.data;
console.log(output.summary); // e.g. [["Issuer", "Notional", ...], [...]]

// ❌ Wrong — these are always undefined
console.log(response.summary);               // undefined — not at top level
console.log(response.result.summary);        // undefined — data is one level deeper
```

**`useFetchWorkflowExecution({ workflowId, workflowExecutionId, workspace, queryOptions? })`**
```ts
const { data } = useFetchWorkflowExecution({ workflowId: "wf-123", workflowExecutionId: "exec-456", workspace });
```

**`useFetchWorkflowExecutions({ workflowId, filters?, order?, projection?, pageSize?, queryOptions? })`**
`filters` must include a `workspace` filter.
```ts
const { query } = useFetchWorkflowExecutions({ workflowId: "wf-123", filters: [{ field: "workspace", value: workspace }] });
```

**`useFetchWorkerExecution({ workflowId, workerExecutionId, workspace, queryOptions? })`**
```ts
const { data } = useFetchWorkerExecution({ workflowId: "wf-123", workerExecutionId: "wkex-456", workspace });
```

**`useFetchWorkerExecutions({ workflowId, workflowExecutionId, filters?, order?, projection?, pageSize?, queryOptions? })`**
```ts
const { query } = useFetchWorkerExecutions({ workflowId: "wf-123", workflowExecutionId: "wfex-456", filters: [{ field: "workspace", value: workspace }] });
```

---

### Workspace — `src/hooks/workspaces/`

**`useFetchWorkspace({ name, queryOptions? })`**
```ts
const { data } = useFetchWorkspace({ name: "main" });
```

**`useFetchWorkspaces({ workspace?, pageSize?, queryOptions? })`**
```ts
const { query } = useFetchWorkspaces({ workspace });
const workspaces = query.data ?? [];
```

---

## Filters, Order & Projection

### Always-fresh single-fetch hooks

`useFetchPortfolio`, `useFetchWorkspace`, `useFetchWorkflowExecution`, and `useFetchWorkerExecution` ship with TanStack Query defaults of `refetchOnMount: "always"`, `staleTime: 0`, `gcTime: 0`. They re-fetch on every mount and never cache between unmounts. Override via `queryOptions` only if you have a concrete reason — caching these values can mask staleness in execution status / workspace metadata.

### API endpoint constraints (gateway-enforced)

These are easy to get wrong if you bypass the hooks and hit `/api` yourself:

- `GET /workflows?workspace=<name>` — `workspace` is a **direct** query-string param, not a JSON `query` filter. `useFetchWorkflows` already handles this; raw axios calls must mirror it.
- A standalone `GET /workflow_executions` endpoint **does not exist**. Executions are always nested under a workflow: `GET /workflows/{workflow_id}/workflow_executions[/{execution_id}]`.
- Worker executions are nested two levels deep: `GET /workflows/{workflow_id}/workflow_executions/{execution_id}/worker_executions[/{worker_execution_id}]`.
- All list endpoints require a `workspace` filter (or, for workflows, the direct query param above) — omitting it returns nothing or errors at the gateway.

### FilterClause — the filter object

All list hooks accept `filters: FilterClause[]`. Each clause has:

```ts
{ field: string; value: unknown; op?: "=" | ">" | ">=" | "<" | "<=" | "!=" }
```

`op` is optional — omitting it means equality (`=`).

### Operators

| op | Meaning | Example |
|----|---------|---------|
| *(omitted)* or `"="` | equals | `{ field: "workspace", value: workspace }` |
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
  { field: "workspace", value: workspace },
];

// filter by name
const filters: FilterClause[] = [
  { field: "workspace", value: workspace },
  { field: "name", value: "My Portfolio" },
];

// filter by date range (format: "YYYYMMDD")
const filters: FilterClause[] = [
  { field: "workspace", value: workspace },
  { field: "date", op: ">=", value: "20260101" },
  { field: "date", op: "<=", value: "20261231" },
];

// filter by link_uid (e.g. datastores linked to a specific portfolio)
const filters: FilterClause[] = [
  { field: "workspace", value: workspace },
  { field: "link_uid", value: "pf-abc123" },
];

// filter by tag
const filters: FilterClause[] = [
  { field: "workspace", value: workspace },
  { field: "tags", value: "risk" },
];

// combining multiple common fields
const filters: FilterClause[] = [
  { field: "workspace", value: workspace },
  { field: "link_uid", value: "pf-abc123" },
  { field: "date", op: ">=", value: "20260101" },
  { field: "date", op: "<=", value: "20261231" },
];
```

### Workspace filter is mandatory

Every list hook (`useFetchPortfolios`, `useFetchDatastores`, `useFetchFiles`, `useFetchWorkflowExecutions`, `useFetchWorkerExecutions`) **requires** a `workspace` filter. Omitting it will return no results or cause an API error.

```ts
// ❌ Missing workspace — will not work
const filters = [{ field: "status", value: "ACTIVE" }];

// ✅ Always include workspace first
const filters = [
  { field: "workspace", value: workspace },
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
const { query } = useFetchPortfolios({ filters: [{ field: "workspace", value: workspace }] });

const portfolios = query.data ?? [];
const canLoadMore = query.hasNextPage && !query.isFetchingNextPage;

// Load next page (e.g. on scroll or button click)
query.fetchNextPage();
```

---

## Utility Hooks

**`useAxios(url?: string | null)`** — `src/hooks/useAxios/index.tsx`
Returns `{ api }`: memoized Axios instance with `baseURL=/api`. Do not create your own Axios instance.
- Optional `url` is reserved for advanced overrides — leave it unset and call `api.get("/portfolios")` etc. with relative paths.
- Request interceptor for GET/DELETE: extracts `workspace` from `params.query` (JSON string) and injects it as `params.workspace`.
```ts
const { api } = useAxios();
api.get("/some-endpoint").then(res => console.log(res.data));
```

**`useAppAlert()`** — `src/hooks/useAppAlert.tsx`
Returns `{ showAlert(options), hideAlert() }`. Use for success/error feedback — do not use `alert()` or custom toast libraries. **Throws** if used outside `<AppAlertProvider>`.
```ts
const { showAlert } = useAppAlert();
showAlert({ message: "Saved.", severity: "success", autoHideDuration: 3000 });
```

**`useAppConfig()`** — `src/hooks/useAppConfig.tsx`
Returns `{ appId, appEnvironmentVar }`. Use to read runtime config — do not read `window.APP_CONFIG` directly. **Throws** if used outside `<AppConfigProvider>`.
```ts
const { appId, appEnvironmentVar } = useAppConfig();
```

Both `useBroadcastChannel()` and `useBroadcastSubscription()` **throw** if used outside `<BroadcastChannelProvider>` (the subscription hook delegates to `useBroadcastChannel` internally).

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

- Sends `REQUEST_AG_GRID_LICENSE` on mount; listens for `SEND_AG_GRID_LICENSE` from the Everysk shell and calls `LicenseManager.setLicenseKey(license)`.
- **Production:** renders `<GlobalLoading>` until the license arrives.
- **Development** (`import.meta.env.DEV`): renders children immediately.
- If `ag-grid-enterprise` is not installed: dynamic import fails silently and children render normally.
- Must be inside `<BroadcastChannelProvider>`.

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