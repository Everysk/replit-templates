import { useMemo, type PropsWithChildren } from "react";

import AppConfigContext from ".";
import type { AppConfigContextType } from "./appConfigType";

/**
 * AppConfigProvider
 *
 * React context provider responsible for exposing the application's runtime configuration (`AppConfigContextType`)
 * to the component tree.
 *
 * Configuration sources:
 * - `window.APP_CONFIG`:
 *   Base configuration injected into the page (e.g., by the server in `index.html`) and available at runtime.
 *
 * - `/app-config.dev.json` (DEV only):
 *   Optional development override file that is fetched during application bootstrap (before React is mounted),
 *   typically in `main.tsx`. If present, its values are shallow-merged into `window.APP_CONFIG`, overriding
 *   top-level keys from the base config.
 *
 * Merge strategy:
 * - A shallow merge is performed during bootstrap:
 *   - `window.APP_CONFIG = { ...window.APP_CONFIG, ...devEnvConfig }`
 * - This means top-level keys in `devEnvConfig` override matching keys in `window.APP_CONFIG`.
 * - Nested objects are not deep-merged; if a nested object key exists in `devEnvConfig`, it replaces
 *   the entire nested object from the base config.
 *
 * Provider value (AppConfigContextType):
 * - `appId`:
 *   Read from `window.APP_ID` (or `null` if not defined).
 * - `appEnvironmentVar`:
 *   The final runtime configuration object from `window.APP_CONFIG` (already merged during bootstrap).
 *
 * Lifecycle notes:
 * - This provider does not perform network requests and does not update its value after mount.
 * - Because configuration is resolved before `createRoot(...).render(...)`, the component tree receives a
 *   consistent configuration from the first render (no intermediate "base-only" render in DEV).
 *
 * Example:
 * ```ts
 * // App root
 * <AppConfigProvider>
 *   <App />
 * </AppConfigProvider>
 *
 * // Consumer hook usage
 * const { appId, appEnvironmentVar } = useAppConfig();
 * console.log(appId, appEnvironmentVar);
 * ```
 */

export const AppConfigProvider = ({ children }: PropsWithChildren) => {
    const value: AppConfigContextType = useMemo(() => {
        const merged = (window.APP_CONFIG ?? {}) as Record<string, unknown>;

        return {
            appId: window.APP_ID ?? null,
            appEnvironmentVar: merged,
        };
    }, []);

    return (
        <AppConfigContext.Provider value={value}>
            {children}
        </AppConfigContext.Provider>
    );
};