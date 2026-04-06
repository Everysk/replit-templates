# Vite Build & Dev Server

## vite.config.ts
- Reads `PROJECT_ROOT` env var (fallback: cwd)
- Loads .env from project root
- Port: `PORT` env var or 5000, `strictPort: true`, `allowedHosts: true`
- `base: "./"`, `outDir: "./dist"`

## Dev Server Proxy (vite/serverProxy.ts)
- Route: `/api` → `EVERYSK_API_URL` (default: https://api.everysk.com/v2)
- `rewrite`: strips `/api` prefix
- `changeOrigin: true`, `xfwd: true`
- Removes `origin` and `referer` headers
- Adds `Authorization: Bearer {EVERYSK_API_SID}:{EVERYSK_API_TOKEN}`
- **Only active during `vite serve` (dev mode)**

## Vite Plugins
| Plugin | apply | Purpose |
|--------|-------|---------|
| `@vitejs/plugin-react` | both | React + babel-plugin-react-compiler |
| `@tailwindcss/vite` | both | Tailwind CSS 4 |
| `envVarsLocationPlugin` | **build only** | Injects `<meta name="app-config">` into index.html |
| `serveDevAppConfigPlugin` | **serve only** | Serves `dev/app-config.dev.json` at `/app-config.dev.json` |

## App Config Loading (src/main.tsx: loadDevConfigAndMergeIntoWindow)
- In dev: fetches `/app-config.dev.json` from Vite plugin → `window.APP_CONFIG`
- In production: `<meta name="app-config">` tag tells runtime where to load config
- `dev/app-config.dev.json` content: `{"app": ""}` — fill in app name for dev

## npm Scripts
- `npm run dev` → vite (dev server)
- `npm run build` → tsc -b && vite build
- `npm run lint` → eslint
- `npm run preview` → vite preview
