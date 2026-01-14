import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App.tsx";

type AppConfig = Record<string, unknown>;

async function loadDevConfigAndMergeIntoWindow() {
  if (!import.meta.env.DEV) return;

  try {
    const res = await fetch("/app-config.dev.json", { cache: "no-store" });

    if (!res.ok) {
      console.warn("app-config.dev.json not found or invalid");
      return;
    }

    const json = (await res.json()) as unknown;

    if (json && typeof json === "object" && !Array.isArray(json)) {
      const base = (window.APP_CONFIG ?? {}) as AppConfig;
      window.APP_CONFIG = { ...base, ...(json as AppConfig) };
    } else {
      console.warn("app-config.dev.json must be a JSON object at the top level");
    }
  } catch (e) {
    console.warn("Failed to load app-config.dev.json:", e);
  }
}

async function bootstrap() {
  await loadDevConfigAndMergeIntoWindow();

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

bootstrap();
