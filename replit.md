# App Template (Everysk)

## Overview
A React + TypeScript + Vite frontend application template. Uses MUI, Tailwind CSS, TanStack Query, and wouter for routing. Designed as a template for building Everysk platform applications.

## Project Architecture
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4 + MUI (Material UI) 7
- **State/Data**: TanStack React Query, Axios
- **Routing**: wouter
- **Dev Proxy**: Vite dev server proxies `/api` requests to the Everysk API

## Project Structure
- `src/` - Application source code
  - `components/` - Reusable UI components
  - `contexts/` - React context providers
  - `hooks/` - Custom React hooks
  - `pages/` - Page components
  - `types/` - TypeScript type definitions
  - `utils/` - Utility functions and API helpers
- `vite/` - Custom Vite plugins (env vars, dev app config, server proxy)
- `dev/` - Development configuration files
- `public/` - Static assets

## Environment Variables (Replit Secrets)

This app requires three secrets to connect to the Everysk API. Add them in the **Secrets** tab (lock icon in the left sidebar):

| Secret | Required | Description |
|--------|----------|-------------|
| `EVERYSK_API_SID` | **Yes** | Your Everysk API account SID |
| `EVERYSK_API_TOKEN` | **Yes** | Your Everysk API authentication token |
| `EVERYSK_APP_NAME` | **Yes** | Your Everysk application name (used during deploy) |

Get your credentials from: https://everysk.com/account

### Setup Steps

1. Click the **Secrets** tab (lock icon) in the left sidebar
2. Add `EVERYSK_API_SID` with your API SID value
3. Add `EVERYSK_API_TOKEN` with your API token value
4. Add `EVERYSK_APP_NAME` with your Everysk application name
5. Click **Run** — the app validates secrets on startup and will tell you if anything is missing

## AI Integration (Anthropic Claude)
- **Provider**: Anthropic directly (user's own API key)
- **SDK**: `@anthropic-ai/sdk`
- **Environment Variables**:
  - `ANTHROPIC_API_KEY` (user-provided, stored in Replit Secrets)
- **Available Models**: claude-opus-4-6, claude-sonnet-4-6, claude-haiku-4-5
- **Reference Files**: `.replit_integration_files/` contains template code for chat routes, batch processing, and storage patterns

### Usage Example
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

## Agent Preferences

- **Always read `replit.md` before starting or restarting any workflow.** This file contains required secrets, setup steps, and project context that must be reviewed before running the app. Do not start workflows blindly.
- **On first run / initial setup / import:** Before starting any workflow, use the environment-secrets skill to check whether the required secrets (`EVERYSK_API_SID`, `EVERYSK_API_TOKEN`, and `EVERYSK_APP_NAME`) exist. If any are missing, immediately use `requestEnvVar` to prompt the user for all missing secrets — do NOT just tell the user to add them manually. Always proactively request them programmatically so the user gets an interactive prompt. Do not start workflows without these secrets — the app will fail with a clear error from `scripts/check-env.sh`.
- **Always use Anthropic (Claude) via the user's own API key** for any AI/chat features in the app. Use the SDK and `ANTHROPIC_API_KEY` environment variable documented above.

### Required Agent Skills (MANDATORY — Every Conversation)

**IMPORTANT:** The following agent skills **must** be loaded and used in every conversation, every new session, and on every fresh app import. These skills are installed in `.agents/skills/` and persist across all copies of this template. The agent must read and follow the relevant SKILL.md file before performing any work that matches the "When to Use" criteria.

| Skill | Path | When to Use |
|-------|------|-------------|
| **brainstorming** | `.agents/skills/brainstorming` | **Before any creative work** — creating features, building components, adding functionality, or modifying behavior. Always explore user intent, requirements, and design before implementation. |
| **everysk-lib-sdk** | `.agents/skills/everysk/everysk-lib-sdk` | When working with the Everysk Python SDK/API — portfolios, datastores, workflows, and automation. |
| **everysk-mcp** | `.agents/skills/everysk/everysk-mcp` | When working with Everysk MCP server implementations and integration patterns. |
| **everysk-worker-builder** | `.agents/skills/everysk/workers-everysk-skill` | When building new workers in the Everysk workers-everysk platform. |
| **frontend-design** | `.agents/skills/frontend-design` | When building or styling any UI — web components, pages, dashboards, layouts. Produces polished, production-grade interfaces. |
| **agent-tools** | `.agents/skills/agent-tools` | When running AI apps via inference.sh CLI — image generation, video creation, LLMs, search, 3D, Twitter automation (FLUX, Veo, Gemini, Grok, Claude, etc.). |
| **pdf** | `.agents/skills/pdf` | When doing anything with PDF files — reading, merging, splitting, creating, filling forms, OCR, watermarks, encryption. |
| **find-skills** | `.agents/skills/find-skills` | When the user asks "how do I do X" or looks for functionality that might exist as an installable skill. |

**Mandatory Rules (apply to every conversation, including new sessions and fresh imports):**
- Always load the **brainstorming** skill before starting any creative or feature-building work. Do NOT skip this step.
- Always load the relevant **Everysk** skill(s) when the task involves Everysk platform entities, APIs, workers, or workflows.
- Always load the **frontend-design** skill when building or modifying any UI component or page.
- Always load the **agent-tools** skill when running AI model inference, image/video generation, or web search via CLI.
- Always load the **pdf** skill when the user mentions `.pdf` files or asks to produce/manipulate PDFs.
- Always load the **find-skills** skill when the user asks about discovering new capabilities or extending functionality.
- These rules apply to **every conversation** — not just the first one. On every new conversation or fresh import, re-read this section and follow the skill requirements.

## Dashboard Feature
The app includes a management dashboard (`src/pages/dashboard/`) for creating and managing portfolios and datastores across workspaces.

### Key files:
- `src/pages/dashboard/index.tsx` — Main dashboard page with workspace selector and two side-by-side panels
- `src/pages/dashboard/PortfolioPanel.tsx` — Portfolio list with create/delete operations
- `src/pages/dashboard/PortfolioCreateDialog.tsx` — Dialog for creating portfolios with securities table
- `src/pages/dashboard/DatastorePanel.tsx` — Datastore list with create/delete operations
- `src/pages/dashboard/DatastoreCreateDialog.tsx` — Dialog for creating datastores with table data editor
- `src/components/WorkspaceSelector.tsx` — Reusable workspace dropdown selector
- `src/hooks/useFetchPortfolio.tsx` — TanStack Query hook for fetching portfolios
- `src/hooks/usePortfolioMutations.tsx` — Mutation hook for portfolio CRUD
- `src/hooks/useFetchDatastore.tsx` — TanStack Query hook for fetching datastores
- `src/hooks/useDatastoreMutations.tsx` — Mutation hook for datastore CRUD
- `src/hooks/useFetchWorkspaces.tsx` — TanStack Query hook for fetching workspaces

### API Endpoints Used:
- `GET /workspaces` — List all workspaces
- `GET /portfolios` — List portfolios (with workspace filter)
- `POST /portfolios` — Create a portfolio
- `DELETE /portfolios/{id}` — Delete a portfolio
- `GET /datastores` — List datastores (with workspace filter)
- `POST /datastores` — Create a datastore
- `DELETE /datastores/{id}` — Delete a datastore

### Features:
- Workspace dropdown selector that auto-selects the first workspace
- Portfolio panel: list, create (with name, currency, date, description, securities table), delete
- Datastore panel: list, create (with name, description, tabular data editor with editable headers/rows/columns), delete
- Responsive layout: side-by-side on desktop, stacked on mobile
- Loading skeletons, empty states, and error handling throughout
- All interactive elements have `data-testid` attributes for testing

## Running
- Dev server: `bash scripts/check-env.sh && npm run dev` (port 5000) — validates secrets before starting Vite
- Build: `npm run build` (outputs to `dist/`)
- Deploy: Use the "Deploy App" workflow in Replit (runs `scripts/replit-deploy.sh`)
  - Automatically installs Python dependencies from `requirements.txt` before building
  - Builds the frontend, packages the `dist/` directory, and deploys to the Everysk API
  - Equivalent to the GitHub Actions workflow in `.github/workflows/deploy.yaml`
  - Requires `EVERYSK_API_SID`, `EVERYSK_API_TOKEN`, and `EVERYSK_APP_NAME` secrets

## Deploy Prerequisites
- **Python dependencies** (`requirements.txt`): `requests`, `python-dotenv`, `everysk-lib`, `httpx` — installed automatically by `scripts/replit-deploy.sh` before each deploy
- **Node build**: `npm run build` must complete without errors. Use `ReactElement` (not `ReactNode`) for MUI `Chip` `icon` props and similar typed element props
- If adding new Python dependencies needed by deploy scripts, add them to `requirements.txt` — the deploy script runs `pip install -q -r requirements.txt` automatically
