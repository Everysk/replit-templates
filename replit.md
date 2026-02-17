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

This app requires two secrets to connect to the Everysk API. Add them in the **Secrets** tab (lock icon in the left sidebar):

| Secret | Required | Description |
|--------|----------|-------------|
| `EVERYSK_API_SID` | **Yes** | Your Everysk API account SID |
| `EVERYSK_API_TOKEN` | **Yes** | Your Everysk API authentication token |

Get your credentials from: https://everysk.com/account

### Setup Steps

1. Click the **Secrets** tab (lock icon) in the left sidebar
2. Add `EVERYSK_API_SID` with your API SID value
3. Add `EVERYSK_API_TOKEN` with your API token value
4. Click **Run** — the app validates secrets on startup and will tell you if anything is missing

## Running
- Dev server: `npm run dev` (port 5000)
- Build: `npm run build` (outputs to `dist/`)
- Deployment: Static site from `dist/` directory
