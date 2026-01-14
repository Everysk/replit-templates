import { createContext } from "react";
import type { AppAlertContextType } from "./appAlertType";

const AppAlertContext = createContext<AppAlertContextType | null>(null);
export default AppAlertContext;