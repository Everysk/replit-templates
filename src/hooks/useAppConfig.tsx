import { useContext } from "react";

import AppConfigContext from "../contexts/appConfigContext";

/**
 * useAppConfig
 *
 * Convenience hook that reads the current application configuration from `AppConfigContext`.
 *
 * Behavior:
 * - Returns the `AppConfigContextType` value provided by `<AppConfigProvider>`.
 * - Throws a descriptive error if called outside of an `<AppConfigProvider>` scope, to fail fast and
 *   avoid undefined configuration usage throughout the app.
 *
 * Usage:
 * ```ts
 * const { appId, appEnvironmentVar } = useAppConfig();
 * ```
 *
 * @throws {Error}
 *  Throws if the hook is used outside of `<AppConfigProvider>`.
 */

const useAppConfig = () => {
    const context = useContext(AppConfigContext);
    if (!context) {
        throw new Error("useAppConfig must be used within <AppConfigProvider>.");
    }
    return context;
};

export default useAppConfig;
