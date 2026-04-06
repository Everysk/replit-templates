# Hooks Reference

All hooks live in `src/hooks/`.

## Fetch Hooks (useQuery-based)
| Hook | Query Key | API Function | Notes |
|------|-----------|--------------|-------|
| `useFetchWorkflows` | ["workflows", workspace\|"all"] | `getWorkflows` | Props: workspace, enabled, refetchInterval, staleTime |
| `useFetchWorkflowExecutions` | ["workflow_executions", wfId] | `getWorkflowExecutions` | Uses `useQueries` for multiple wfIds; returns flat `allExecutions[]` |
| `useFetchWorkspaces` | — | `getWorkspaces` | — |
| `useFetchPortfolio` | — | `getPortfolio/s` | — |
| `useFetchDatastore` | — | `getDatastore/s` | — |
| `useFetchFile` | — | file API | — |

## Mutation Hooks
| Hook | Purpose |
|------|---------|
| `useRunWorkflowMutations` | POST /workflows/{id}/run |
| `usePortfolioMutations` | Portfolio CRUD mutations |
| `useDatastoreMutations` | Datastore CRUD mutations |
| `useFileMutations` | File CRUD mutations |

## Context Hooks
| Hook | Returns |
|------|---------|
| `useAppAlert` | `{ showAlert, hideAlert }` |
| `useAppConfig` | `{ appId, appEnvironmentVar }` |
| `useBroadcastChannel` | `{ post, subscribe, lastMessage }` |
| `useBroadcastSubscription` | Subscribe to broadcast channel messages |

## useAxios
- `const { api } = useAxios(url?)` — creates Axios instance, default baseURL `/api`
- Interceptor: extracts workspace from query params JSON

## Error Pattern (all fetch hooks)
```tsx
useEffect(() => {
  if (!query.error) return;
  showAlert({ severity: "error", message: query.error.message });
}, [query.error, showAlert]);
```
