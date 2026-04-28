import type React from "react";
import { useMemo } from "react";

import CssBaseline from '@mui/material/CssBaseline';
import ThemeProvider from "@mui/system/ThemeProvider";
import type { Theme } from "@mui/material/styles";

import getTheme from "./themes";

const ThemeProviderWrapper = ({ children }: React.PropsWithChildren) => {

    const theme: Theme = useMemo(() => getTheme(), []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}

export default ThemeProviderWrapper;