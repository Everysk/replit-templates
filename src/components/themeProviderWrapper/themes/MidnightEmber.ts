import { createTheme, type Theme } from "@mui/material";

import type { } from '@mui/x-date-pickers/themeAugmentation';

import { MuiCssBaseline } from "../overrides/muiCssBaseline";
import { MuiDatePicker } from "../overrides/muiDatePicker";
import { MuiTextField } from "../overrides/muiTextField";
import { MuiFormControl } from "../overrides/muiFormControl";
import { MuiSelect } from "../overrides/muiSelect";
import { MuiSvgIcon } from "../overrides/muiSvgIcon";
import { MuiToggleButton } from "../overrides/muiToggleButton";
import { MuiToggleButtonGroup } from "../overrides/muiToggleButtonGroup";
import { MuiIconButton } from "../overrides/muiIconButton";
import { MuiButton } from "../overrides/muiButton";


const MidnightEmberTheme: Theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#F97316',
            dark: '#EA580C',
            light: '#FDBA74',
            contrastText: '#020617',
        },
        secondary: {
            main: '#94A3B8',
            dark: '#64748B',
            light: '#CBD5F5',
            contrastText: '#020617',
        },
        background: {
            default: '#020617',
            paper: '#0B1120',
        },
        text: {
            primary: '#F9FAFB',
        },
        divider: 'rgba(148, 163, 184, 0.25)'
    },
    components: {
        MuiCssBaseline,
        MuiDatePicker,
        MuiTextField,
        MuiSelect,
        MuiFormControl,
        MuiSvgIcon,
        MuiToggleButton,
        MuiToggleButtonGroup,
        MuiButton,
        MuiIconButton,
    }
});

export default MidnightEmberTheme;