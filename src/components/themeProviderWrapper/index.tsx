import type React from "react";
import { useMemo } from "react";

import CssBaseline from '@mui/material/CssBaseline';
import type { Theme } from "@mui/material/styles";
import { ThemeProvider, createTheme } from '@mui/material/styles';

const ThemeProviderWrapper = ({ children }: React.PropsWithChildren) => {

    const theme: Theme = useMemo(() => createTheme({}), []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}

export default ThemeProviderWrapper;