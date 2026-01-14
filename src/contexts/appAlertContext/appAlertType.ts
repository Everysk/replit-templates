import type { AlertColor, SnackbarProps } from "@mui/material";

export type AppAlertState = Omit<SnackbarProps, "open" | "onClose" | "message"> & {
    open: boolean;
    message: string;
    severity: AlertColor;
};

export type ShowAlertOptions = Partial<Omit<AppAlertState, "open">> & {
    message: string;
};

export type AppAlertContextType = {
  showAlert: (options: ShowAlertOptions) => void;
  hideAlert: () => void;
};