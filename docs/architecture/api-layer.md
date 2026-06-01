# API Layer

## src/utils/api/ — API Functions
All functions accept an `AxiosInstance` as first param (from `useAxios()`).

| File | Functions | Endpoints |
|------|-----------|-----------|
| workflowList.ts | `getWorkflows(api, workspace?)` | GET /workflows |
| workflowList.ts | `getWorkflowExecutions(api, wfId)` | GET /workflows/{id}/workflow_executions |
| workflowList.ts | `getWorkspaces(api)` | GET /workspaces |
| workflow.ts | `runWorkflow(api, id, workspace, parameters)` | POST /workflows/{id}/run (async start) |
| workflow.ts | `pollWorkflowExecution(api, wfId, execId, workspace, options?)` | GET /workflows/{id}/workflow_executions (poll until terminal) |
| workflow.ts | `runWorkflowAndGetResult(api, id, workspace, parameters, pollOptions?)` | start → poll → fetch ender worker result |
| portfolio.ts | `getPortfolio`, `getPortfolios`, `postPortfolio`, `updatePortfolio`, `deletePortfolio` | /portfolios |
| datastore.ts | `getDatastore`, `getDatastores`, `postDatastore`, `updateDatastore`, `deleteDatastore` | /datastores |
| file.ts | file CRUD | /files |

## NOTE: No standalone /workflow_executions endpoint
Executions are always fetched via `/workflows/{id}/workflow_executions`

## src/utils/apiQuery.ts
- `buildApiQueryParams({ filters, order, page_size, page_token })` — builds Everysk API query params
- `serializeFilter()` — serializes filter expression

## src/utils/queryClient.ts
- Exports shared TanStack `QueryClient` instance

## src/utils/datastore.ts
- Datastore-specific utilities

## Query Keys Convention
- Workflows: `["workflows", workspace ?? "all"]`
- Workflow executions: `["workflow_executions", wfId]`
- Workspaces: (standard)
- Portfolios, Datastores, Files: (standard entity keys)
