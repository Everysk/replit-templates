import { useEffect, useState, type PropsWithChildren } from "react";

import GlobalLoading from "../../components/GlobalLoading";
import type { Message } from "../broadcastChannelContext/broadcastChannelType";
import useBroadcastChannel from "../../hooks/useBroadcastChannel";

/**
 * Manages the AG Grid Enterprise license for the app.
 *
 * Listens for a `SEND_AG_GRID_LICENSE` broadcast message from the parent frame
 * and sets the license key via `LicenseManager.setLicenseKey()`. Until the license
 * is received, children are replaced with a loading screen (production only).
 *
 * **Optional dependency:** This provider requires `ag-grid-enterprise` to be installed.
 * Run `npm install ag-grid-enterprise` before using it.
 * If the package is not installed, children render normally without license enforcement.
 */
export const AgGridLicenseProvider = ({ children }: PropsWithChildren) => {
    const [isLicensed, setIsLicensed] = useState(import.meta.env.DEV);
    const { subscribe, post } = useBroadcastChannel();

    useEffect(() => {
        let cleanup: (() => void) | undefined;
        let cancelled = false;

        // @ts-expect-error - ag-grid-enterprise is an optional dependency
        import(/* @vite-ignore */ "ag-grid-enterprise")
            .then(({ LicenseManager }) => {
                if (cancelled) return;
                cleanup = subscribe((message: Message) => {
                    const { type, payload } = message;
                    const license = (payload as Record<string, unknown>)?.license;
                    if (type === "SEND_AG_GRID_LICENSE" && typeof license === "string") {
                        LicenseManager.setLicenseKey(license);
                        setIsLicensed(true);
                    }
                });
                post({ type: "REQUEST_AG_GRID_LICENSE" });
            })
            .catch(() => setIsLicensed(true));

        return () => {
            cancelled = true;
            cleanup?.();
        };
    }, [subscribe, post]);

    if (!isLicensed) return <GlobalLoading isLoading backdrop={false} message="Setting things up..." />;

    return <>{children}</>;
};

