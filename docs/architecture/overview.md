# chicagojoe-replit-templates Architecture Overview

## Identity
- **Package name**: app_template
- **Branch**: template-updates (5 commits ahead of dev)
- **Stack**: React 19 + TypeScript + Vite 7 + Tailwind CSS 4 + MUI 7 + TanStack Query v5 + Axios + wouter

## Entry Point Chain
```
index.html
  └─ src/main.tsx: bootstrap()
        ├─ loadDevConfigAndMergeIntoWindow()  → fetches /app-config.dev.json → window.APP_CONFIG
        └─ createRoot().render(<StrictMode><App /></StrictMode>)
```

## App Provider Hierarchy (src/App.tsx)
```
BroadcastChannelProvider    (cross-tab messaging via Web BroadcastChannel API, keyed on APP_ID)
  └─ AppConfigProvider      (reads window.APP_CONFIG + window.APP_ID)
       └─ ThemeProviderWrapper  (MUI theme)
            └─ QueryClientProvider  (TanStack Query)
                 └─ AppAlertProvider  (MUI Snackbar alerts)
                      └─ Pages  (wouter hash routing → Home page)
```

## Context Providers
| Provider | File | Exposes |
|----------|------|---------|
| BroadcastChannelProvider | src/contexts/broadcastChannelContext/ | `post`, `subscribe`, `lastMessage` |
| AppConfigProvider | src/contexts/appConfigContext/ | `appId`, `appEnvironmentVar` |
| AppAlertProvider | src/contexts/appAlertContext/ | `showAlert`, `hideAlert` |

## Data Flow Pattern
1. Component calls a hook (e.g., `useFetchWorkflows`)
2. Hook calls `useAxios()` → gets Axios instance (baseURL: `/api`)
3. Hook wraps API function in TanStack `useQuery` / `useMutation`
4. On error, hook calls `showAlert` from `useAppAlert()`
5. API functions in `src/utils/api/` do the actual Axios calls

## Axios (useAxios hook)
- Creates instance with `baseURL: /api`
- Request interceptor: extracts `workspace` from query JSON and adds as param
- In dev: Vite proxies `/api` → `EVERYSK_API_URL` (default: https://api.everysk.com/v2)
- Proxy adds `Authorization: Bearer {SID}:{TOKEN}` header and strips `/api` prefix
