import type { Theme } from '@mui/material/styles';

export const agGridStyles = (theme: Theme) => ({

    '.ag-theme-alpine-dark.ag-custom-app-theme': {
        '--ag-background-color': theme.palette.background.default,
        '--ag-foreground-color': theme.palette.text.primary,
        '--ag-accent-color': theme.palette.primary.main,

        '--ag-odd-row-background-color': theme.palette.background.paper,
        '--ag-row-border-color': theme.palette.divider,

        '--ag-header-background-color': theme.palette.background.paper,
        '--ag-header-foreground-color': theme.palette.text.primary,
        '--ag-header-border-color': theme.palette.divider,
        '--ag-chrome-background-color': theme.palette.background.default,
        '--ag-row-hover-color': theme.palette.action.hover,

        '--ag-icon-color': theme.palette.text.secondary,
        '--ag-secondary-foreground-color': theme.palette.text.secondary,

        '--ag-alpine-active-color': theme.palette.primary.main,
        '--ag-input-background-color': theme.palette.background.default,
        '--ag-input-border-color': theme.palette.divider,
        '--ag-input-focus-border-color': theme.palette.primary.main,

        '--ag-font-family':
            '"Roboto", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        '--ag-header-font-family':
            '"Roboto", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        '--ag-header-font-size': '14px',

        colorScheme: 'dark',
    },

    '.ag-theme-alpine-dark.ag-custom-app-theme .ag-menu': {
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: `var(--Paper-shadow, ${theme.shadows[8]})`,
        backgroundImage: 'var(--Paper-overlay, none)',
    },

    '.ag-theme-alpine-dark.ag-custom-app-theme .ag-tabs-header': {
        backgroundColor: theme.palette.background.paper,
        backgroundImage: 'var(--Paper-overlay, none)',
        borderBottom: `1px solid ${theme.palette.divider}`,
    },

    '.ag-theme-alpine-dark.ag-custom-app-theme .ag-tab-selected': {
        borderBottom: `2px solid ${theme.palette.primary.main}`,
    },

    '.ag-theme-alpine-dark.ag-custom-app-theme .ag-menu .ag-menu-option:hover, \
   .ag-theme-alpine-dark.ag-custom-app-theme .ag-menu .ag-list-item:hover': {
        backgroundColor: theme.palette.action.hover,
        color: theme.palette.text.primary,
    },

    '.ag-theme-alpine-dark.ag-custom-app-theme .ag-menu .ag-menu-option-active, \
   .ag-theme-alpine-dark.ag-custom-app-theme .ag-menu .ag-list-item.ag-active-item': {
        backgroundColor: theme.palette.action.selected,
        color: theme.palette.text.primary,
    },

    '.ag-theme-alpine-dark.ag-custom-app-theme .ag-header-cell-menu-button .ag-icon-menu, \
   .ag-theme-alpine-dark.ag-custom-app-theme .ag-header-cell-menu-button .ag-icon-menu-alt': {
        color: theme.palette.text.secondary,
    },

    '.ag-theme-alpine-dark.ag-custom-app-theme .ag-header-cell-menu-button:hover .ag-icon-menu, \
   .ag-theme-alpine-dark.ag-custom-app-theme .ag-header-cell-menu-button:focus-within .ag-icon-menu, \
   .ag-theme-alpine-dark.ag-custom-app-theme .ag-header-cell-menu-button:hover .ag-icon-menu-alt, \
   .ag-theme-alpine-dark.ag-custom-app-theme .ag-header-cell-menu-button:focus-within .ag-icon-menu-alt': {
        color: theme.palette.primary.main,
        fill: theme.palette.primary.main,
    },


    '.ag-theme-alpine-dark.ag-custom-app-theme .ag-row-hover': {
        backgroundColor: theme.palette.action.hover,
    },

    '.ag-theme-alpine-dark.ag-custom-app-theme .ag-row-selected': {
        backgroundColor: theme.palette.action.selected,
    },

    '.ag-theme-alpine-dark.ag-custom-app-theme .ag-range-selected': {
        borderColor: theme.palette.primary.main,
    },

    '.ag-theme-alpine-dark.ag-custom-app-theme .ag-menu .ag-input-field': {
        fontSize: theme.typography.body2.fontSize,
        fontFamily: theme.typography.fontFamily,
    },

    '.ag-theme-alpine-dark.ag-custom-app-theme .ag-menu .ag-input-field-input': {
        backgroundColor: 'transparent',
        borderRadius: theme.shape.borderRadius,
        border: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
        padding: '6px 10px',
        boxShadow: 'none',
        outline: 'none',
        transition: theme.transitions.create(['border-color', 'box-shadow'], {
            duration: theme.transitions.duration.shorter,
        }),

        '&::placeholder': {
            color: theme.palette.text.secondary,
            opacity: 0.7,
        },

        '&:hover': {
            borderColor: theme.palette.text.secondary,
        },

        '&:focus, &:focus-visible': {
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
        },
    },

    '.ag-theme-alpine-dark.ag-custom-app-theme .ag-menu .ag-picker-field-wrapper': {
        backgroundColor: 'transparent',
        borderRadius: theme.shape.borderRadius,
        border: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
        paddingInline: '10px',
        minHeight: 32,
        boxShadow: 'none',
        outline: 'none',
        display: 'flex',
        alignItems: 'center',
        transition: theme.transitions.create(['border-color', 'box-shadow'], {
            duration: theme.transitions.duration.shorter,
        }),

        '&:hover': {
            borderColor: theme.palette.text.secondary,
        },

        '&:focus-within': {
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
        },
    },

    '.ag-theme-alpine-dark.ag-custom-app-theme .ag-menu .ag-picker-field-display': {
        color: theme.palette.text.primary,
        fontSize: theme.typography.body2.fontSize,
    },

    '.ag-theme-alpine-dark.ag-custom-app-theme .ag-menu .ag-picker-field-icon': {
        color: theme.palette.text.primary,
    },

    '.ag-theme-alpine-dark .ag-list.ag-select-list.ag-popup-child': {
        backgroundColor: theme.palette.background.paper,
        backgroundImage: 'var(--Paper-overlay, none)',
        borderRadius: theme.shape.borderRadius,
        border: `1px solid ${theme.palette.divider}`,
        padding: '4px 0',
        boxShadow: `var(--Paper-shadow, ${theme.shadows[8]})`,
    },

    '.ag-theme-alpine-dark .ag-list.ag-select-list.ag-popup-child .ag-list-item.ag-select-list-item': {
        padding: '6px 12px',
        color: theme.palette.text.primary,
        fontSize: theme.typography.body2.fontSize,
        fontFamily: theme.typography.fontFamily,
        cursor: 'pointer',
        backgroundColor: 'transparent',
    },

    '.ag-theme-alpine-dark .ag-list.ag-select-list.ag-popup-child .ag-list-item.ag-select-list-item:hover': {
        backgroundColor: theme.palette.action.hover,
    },

    '.ag-theme-alpine-dark .ag-list.ag-select-list.ag-popup-child .ag-list-item.ag-select-list-item.ag-active-item, \
   .ag-theme-alpine-dark .ag-list.ag-select-list.ag-popup-child .ag-list-item.ag-select-list-item[aria-selected="true"]':
    {
        backgroundColor: theme.palette.action.selected,
        color: theme.palette.text.primary,
    },
});
