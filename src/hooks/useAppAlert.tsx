import { useContext } from "react";
import AppAlertContext from "../contexts/appAlertContext";

/**
 * useAppAlert
 *
 * Convenience hook that reads the alert API from `AppAlertContext`.
 *
 * Behavior:
 * - Returns the functions exposed by `<AppAlertProvider>`, typically:
 *   - `showAlert(options)` to display an alert
 *   - `hideAlert()` to close the current alert
 *
 * Error handling:
 * - Throws a descriptive error if called outside of an `<AppAlertProvider>` scope, to fail fast
 *   and prevent silent no-op alert calls.
 *
 * Usage:
 * ```ts
 * const { showAlert } = useAppAlert();
 *
 * showAlert({
 *   message: "Saved successfully.",
 *   severity: "success",
 *   autoHideDuration: 3000,
 * });
 * ```
 *
 * @throws {Error}
 *  Throws if the hook is used outside of `<AppAlertProvider>`.
 */


const useAppAlert = () => {
    const ctx = useContext(AppAlertContext);
    if (!ctx) {
        throw new Error("useAppAlert must be used within <AppAlertProvider>.");
    }
    return ctx;
};

export default useAppAlert;