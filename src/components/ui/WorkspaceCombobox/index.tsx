import { useMemo } from "react";

import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CheckIcon from "@mui/icons-material/Check";

import type { Workspace } from "@src/types/workspace";

interface WorkspaceComboboxProps {
    workspaces: Workspace[];
    selected: string;
    onSelect: (name: string) => void;
    label?: string;
    size?: "small" | "medium";
    fullWidth?: boolean;
}

const WorkspaceCombobox = ({
    workspaces,
    selected,
    onSelect,
    label = "Workspace",
    size = "small",
    fullWidth = true,
}: WorkspaceComboboxProps) => {
    const selectedWs = useMemo(
        () => workspaces.find((ws) => ws.name === selected),
        [workspaces, selected]
    );

    const grouped = useMemo(
        () => [...workspaces].sort((a, b) => (a.group ?? "").localeCompare(b.group ?? "")),
        [workspaces]
    );

    return (
        <Autocomplete<Workspace, false, true>
            data-testid="workspace-combobox"
            options={grouped}
            value={selectedWs}
            onChange={(_e, ws) => {
                if (ws) onSelect(ws.name);
            }}
            getOptionLabel={(ws) =>
                ws.group ? `${ws.name} (${ws.group})` : ws.name
            }
            groupBy={(ws) => ws.group ?? ""}
            isOptionEqualToValue={(option, value) => option.name === value.name}
            filterOptions={(options, state) => {
                const q = state.inputValue.toLowerCase().trim();
                if (!q) return options;
                return options.filter(
                    (ws) =>
                        ws.name.toLowerCase().includes(q) ||
                        (ws.group && ws.group.toLowerCase().includes(q))
                );
            }}
            size={size}
            fullWidth={fullWidth}
            disableClearable
            openOnFocus
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    placeholder="Search workspaces..."
                    inputProps={{
                        ...params.inputProps,
                        "data-testid": "workspace-search",
                    }}
                />
            )}
            renderOption={({ key, ...props }, ws) => {
                const isSelected = ws.name === selected;
                return (
                    <Box
                        component="li"
                        key={key}
                        {...props}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            fontSize: "0.8125rem",
                            ...(isSelected && {
                                fontWeight: 600,
                                color: "primary.main",
                            }),
                        }}
                    >
                        {isSelected && (
                            <CheckIcon sx={{ fontSize: 16, color: "primary.main" }} />
                        )}
                        <Typography variant="body2" noWrap sx={{ flex: 1, fontSize: "inherit", fontWeight: "inherit" }}>
                            {ws.name}
                            {ws.group && (
                                <Typography
                                    component="span"
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ ml: 0.5, fontSize: "inherit" }}
                                >
                                    ({ws.group})
                                </Typography>
                            )}
                        </Typography>
                    </Box>
                );
            }}
            ListboxProps={{
                style: { maxHeight: 240 },
                "data-testid": "workspace-list",
            } as React.HTMLAttributes<HTMLUListElement>}
            slotProps={{
                paper: {
                    elevation: 4,
                    sx: { mt: 0.5, borderRadius: 1.5 },
                },
                popper: {
                    sx: { zIndex: 1400 },
                },
            }}
            noOptionsText="No workspaces found"
        />
    );
};

export default WorkspaceCombobox;
