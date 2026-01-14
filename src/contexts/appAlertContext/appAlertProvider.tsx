import { useCallback, useMemo, useState, type PropsWithChildren } from "react";
import { Alert, Snackbar, type SnackbarCloseReason } from "@mui/material";

import AppAlertContext from ".";
import type { AppAlertContextType, AppAlertState, ShowAlertOptions } from "./appAlertType";

/**
 * AppAlertProvider
 *
 * React context provider responsible for exposing a global application alert API and rendering
 * a Material UI `Snackbar` + `Alert` pair anchored to the viewport.
 *
 * What this provider does:
 * - Maintains an internal `AppAlertState` that controls:
 *   - visibility (`open`)
 *   - displayed text (`message`)
 *   - alert tone (`severity`)
 *   - auto-dismiss timing (`autoHideDuration`)
 *   - screen position (`anchorOrigin`)
 * - Exposes an imperative API via context:
 *   - `showAlert(options)` to open/update the alert
 *   - `hideAlert()` to close the alert
 * - Renders the `Snackbar`/`Alert` components once (at the provider level), so any descendant can
 *   trigger alerts without needing to manage UI state locally.
 *
 * Behavior:
 * - `showAlert(options)` performs a shallow merge of the provided options into the current state
 *   and forces `open: true`.
 * - `hideAlert()` sets `open: false` (preserving the remaining state).
 * - Snackbar `onClose` ignores the `"clickaway"` reason to prevent accidental dismissals when the user
 *   clicks outside the toast.
 *
 * Performance / stability:
 * - `showAlert` and `hideAlert` should be stable (e.g., created with `useCallback`) so the context value
 *   does not change on every render, avoiding unnecessary re-renders in consumers.
 *
 * Usage:
 * ```ts
 * <AppAlertProvider>
 *   <App />
 * </AppAlertProvider>
 * ```
 */

export const AppAlertProvider = ({ children }: PropsWithChildren) => {
    const [state, setState] = useState<AppAlertState>({
        open: false,
        message: "",
        severity: "info",
        autoHideDuration: 4000,
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
    });

    const hideAlert = useCallback(() => {
        setState((prev) => ({ ...prev, open: false }));
    }, []);

    const showAlert = useCallback((options: ShowAlertOptions) => {
        setState((prev) => ({
            ...prev,
            ...options,
            open: true,
        }));
    }, []);

    const value: AppAlertContextType = useMemo(
        () => ({ showAlert, hideAlert }),
        [showAlert, hideAlert]
    );

    return (
        <AppAlertContext.Provider value={value}>
            {children}

            <Snackbar
                open={state.open}
                message={state.message}
                autoHideDuration={state.autoHideDuration}
                anchorOrigin={state.anchorOrigin}
                onClose={(_, reason: SnackbarCloseReason) => {
                    if (reason === "clickaway") return;
                    hideAlert();
                }}
            >
                <Alert onClose={hideAlert} severity={state.severity} variant="filled" elevation={6}>
                    {state.message}
                </Alert>
            </Snackbar>
        </AppAlertContext.Provider>
    );
};
