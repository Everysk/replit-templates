import { createTheme, type Theme } from "@mui/material";

import MidnightEmberTheme from "./MidnightEmber";

const themes: Map<string, Theme> = new Map<string, Theme>([
    ["Midnight Ember", MidnightEmberTheme]
]);

const getTheme = (name?: string): Theme => {
    const theme = themes.get(name || "") || createTheme({});
    return theme;
}

export default getTheme;