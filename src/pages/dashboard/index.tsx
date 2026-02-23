import { useState, useMemo, useCallback, type ReactNode } from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddIcon from "@mui/icons-material/Add";

import useFetchWorkflows from "../../hooks/useFetchWorkflows";
import useFetchWorkflowExecutions from "../../hooks/useFetchWorkflowExecutions";
import type { WorkflowExecution, WorkflowExecutionStatus } from "../../types/workflow";
import type { FilterClause } from "../../types/entityQuery";

const STATUS_CONFIG: Record<string, { color: "success" | "error" | "warning" | "info" | "default"; icon: ReactNode; label: string }> = {
    COMPLETED: { color: "success", icon: <CheckCircleIcon fontSize="small" />, label: "Completed" },
    FAILED: { color: "error", icon: <ErrorIcon fontSize="small" />, label: "Failed" },
    RUNNING: { color: "warning", icon: <PlayCircleIcon fontSize="small" />, label: "Running" },
    PENDING: { color: "info", icon: <HourglassEmptyIcon fontSize="small" />, label: "Pending" },
    CANCELLED: { color: "default", icon: <CancelIcon fontSize="small" />, label: "Cancelled" },
};

const getStatusConfig = (status: WorkflowExecutionStatus) => {
    return STATUS_CONFIG[status] ?? { color: "default" as const, icon: <HourglassEmptyIcon fontSize="small" />, label: status };
};

const formatDateTime = (dateStr: string | undefined | null): string => {
    if (!dateStr) return "—";
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleString();
    } catch {
        return dateStr;
    }
};

const formatDuration = (started: string | undefined | null, finished: string | undefined | null): string => {
    if (!started || !finished) return "—";
    try {
        const startDate = new Date(started);
        const endDate = new Date(finished);
        const diffMs = endDate.getTime() - startDate.getTime();
        if (diffMs < 0 || isNaN(diffMs)) return "—";
        if (diffMs < 1000) return `${diffMs}ms`;
        const seconds = Math.floor(diffMs / 1000);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    } catch {
        return "—";
    }
};

interface SummaryCardProps {
    title: string;
    value: number;
    color: string;
    icon: ReactNode;
    testId: string;
}

const SummaryCard = ({ title, value, color, icon, testId }: SummaryCardProps) => (
    <Card
        data-testid={testId}
        sx={{ minWidth: 140, flex: 1 }}
        variant="outlined"
    >
        <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: 2, "&:last-child": { pb: 2 } }}>
            <Box sx={{ color, display: "flex", alignItems: "center" }}>{icon}</Box>
            <Box>
                <Typography variant="h4" fontWeight={700} data-testid={`${testId}-value`}>
                    {value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {title}
                </Typography>
            </Box>
        </CardContent>
    </Card>
);

const REFETCH_INTERVALS = [
    { label: "Off", value: 0 },
    { label: "10s", value: 10000 },
    { label: "30s", value: 30000 },
    { label: "1m", value: 60000 },
    { label: "5m", value: 300000 },
];

const Dashboard = () => {
    const [workspaceInput, setWorkspaceInput] = useState("");
    const [workspaces, setWorkspaces] = useState<string[]>([]);
    const [refetchInterval, setRefetchInterval] = useState(30000);

    const handleAddWorkspace = useCallback(() => {
        const trimmed = workspaceInput.trim();
        if (trimmed && !workspaces.includes(trimmed)) {
            setWorkspaces((prev) => [...prev, trimmed]);
        }
        setWorkspaceInput("");
    }, [workspaceInput, workspaces]);

    const handleRemoveWorkspace = useCallback((ws: string) => {
        setWorkspaces((prev) => prev.filter((w) => w !== ws));
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddWorkspace();
        }
    }, [handleAddWorkspace]);

    const hasWorkspaces = workspaces.length > 0;

    return (
        <Box sx={{ maxWidth: 1400, mx: "auto", p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <DashboardIcon sx={{ fontSize: 32, color: "primary.main" }} />
                <Typography variant="h5" fontWeight={700} data-testid="text-dashboard-title">
                    Workflow Operations Dashboard
                </Typography>
            </Box>

            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                    <TextField
                        data-testid="input-workspace"
                        label="Add workspace"
                        size="small"
                        value={workspaceInput}
                        onChange={(e) => setWorkspaceInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter workspace name"
                        sx={{ minWidth: 220 }}
                    />
                    <IconButton
                        data-testid="button-add-workspace"
                        onClick={handleAddWorkspace}
                        color="primary"
                        disabled={!workspaceInput.trim()}
                    >
                        <AddIcon />
                    </IconButton>

                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Auto-refresh</InputLabel>
                        <Select
                            data-testid="select-refetch-interval"
                            value={refetchInterval}
                            onChange={(e) => setRefetchInterval(Number(e.target.value))}
                            input={<OutlinedInput label="Auto-refresh" />}
                        >
                            {REFETCH_INTERVALS.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", flex: 1 }}>
                        {workspaces.map((ws) => (
                            <Chip
                                key={ws}
                                label={ws}
                                onDelete={() => handleRemoveWorkspace(ws)}
                                data-testid={`chip-workspace-${ws}`}
                                color="primary"
                                variant="outlined"
                            />
                        ))}
                    </Box>
                </Box>
            </Paper>

            {!hasWorkspaces && (
                <Paper
                    variant="outlined"
                    sx={{
                        p: 6,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                        textAlign: "center",
                    }}
                >
                    <DashboardIcon sx={{ fontSize: 64, color: "action.disabled" }} />
                    <Typography variant="h6" color="text.secondary" data-testid="text-empty-state">
                        Add a workspace to get started
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Enter a workspace name above and press Enter or click the add button.
                    </Typography>
                </Paper>
            )}

            {workspaces.map((workspace) => (
                <WorkspaceSection
                    key={workspace}
                    workspace={workspace}
                    refetchInterval={refetchInterval}
                />
            ))}
        </Box>
    );
};

interface WorkspaceSectionProps {
    workspace: string;
    refetchInterval: number;
}

const WorkspaceSection = ({ workspace, refetchInterval }: WorkspaceSectionProps) => {
    const workspaceFilter: FilterClause[] = useMemo(
        () => [{ field: "workspace", value: workspace }],
        [workspace]
    );

    const workflowsQuery = useFetchWorkflows({
        filters: workspaceFilter,
        order: ["name asc"],
        queryOptions: {
            refetchInterval: refetchInterval || false,
            staleTime: 10000,
        },
    });

    const executionsQuery = useFetchWorkflowExecutions({
        filters: workspaceFilter,
        order: ["created desc"],
        queryOptions: {
            refetchInterval: refetchInterval || false,
            staleTime: 10000,
        },
    });

    const isLoading = workflowsQuery.isLoading || executionsQuery.isLoading;
    const isFetching = workflowsQuery.isFetching || executionsQuery.isFetching;

    const workflows = workflowsQuery.data ?? [];
    const executions = executionsQuery.data ?? [];

    const latestExecutionByWorkflow = useMemo(() => {
        const map = new Map<string, WorkflowExecution>();
        for (const exec of executions) {
            const wfId = exec.workflow_id;
            if (!wfId) continue;
            const existing = map.get(wfId);
            if (!existing || new Date(exec.created) > new Date(existing.created)) {
                map.set(wfId, exec);
            }
        }
        return map;
    }, [executions]);

    const statusCounts = useMemo(() => {
        const counts = { total: executions.length, COMPLETED: 0, FAILED: 0, RUNNING: 0, PENDING: 0, CANCELLED: 0, OTHER: 0 };
        for (const exec of executions) {
            const status = exec.run_status;
            if (status in counts) {
                (counts as Record<string, number>)[status]++;
            } else {
                counts.OTHER++;
            }
        }
        return counts;
    }, [executions]);

    const handleRefresh = useCallback(() => {
        workflowsQuery.refetch();
        executionsQuery.refetch();
    }, [workflowsQuery, executionsQuery]);

    return (
        <Paper variant="outlined" sx={{ mb: 3, overflow: "hidden" }} data-testid={`section-workspace-${workspace}`}>
            {isFetching && <LinearProgress sx={{ height: 2 }} />}

            <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid", borderColor: "divider" }}>
                <Typography variant="h6" fontWeight={600} data-testid={`text-workspace-name-${workspace}`}>
                    {workspace}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                        {workflows.length} workflow{workflows.length !== 1 ? "s" : ""} · {executions.length} execution{executions.length !== 1 ? "s" : ""}
                    </Typography>
                    <Tooltip title="Refresh">
                        <IconButton
                            data-testid={`button-refresh-${workspace}`}
                            onClick={handleRefresh}
                            size="small"
                            disabled={isFetching}
                        >
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {isLoading ? (
                <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
                    <CircularProgress data-testid={`loading-${workspace}`} />
                </Box>
            ) : (
                <Box sx={{ p: 2 }}>
                    <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                        <SummaryCard
                            title="Total Executions"
                            value={statusCounts.total}
                            color="#1976d2"
                            icon={<DashboardIcon />}
                            testId={`card-total-${workspace}`}
                        />
                        <SummaryCard
                            title="Completed"
                            value={statusCounts.COMPLETED}
                            color="#2e7d32"
                            icon={<CheckCircleIcon />}
                            testId={`card-completed-${workspace}`}
                        />
                        <SummaryCard
                            title="Failed"
                            value={statusCounts.FAILED}
                            color="#d32f2f"
                            icon={<ErrorIcon />}
                            testId={`card-failed-${workspace}`}
                        />
                        <SummaryCard
                            title="Running"
                            value={statusCounts.RUNNING}
                            color="#ed6c02"
                            icon={<PlayCircleIcon />}
                            testId={`card-running-${workspace}`}
                        />
                        <SummaryCard
                            title="Pending"
                            value={statusCounts.PENDING}
                            color="#0288d1"
                            icon={<HourglassEmptyIcon />}
                            testId={`card-pending-${workspace}`}
                        />
                    </Box>

                    {workflows.length === 0 ? (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ textAlign: "center", py: 3 }}
                            data-testid={`text-no-workflows-${workspace}`}
                        >
                            No workflows found in this workspace.
                        </Typography>
                    ) : (
                        <TableContainer>
                            <Table size="small" data-testid={`table-workflows-${workspace}`}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600 }}>Workflow</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Latest Status</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Started</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Execution ID</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {workflows.map((wf) => {
                                        const latestExec = latestExecutionByWorkflow.get(wf.id);
                                        const statusConf = latestExec
                                            ? getStatusConfig(latestExec.run_status)
                                            : null;

                                        return (
                                            <TableRow
                                                key={wf.id}
                                                data-testid={`row-workflow-${wf.id}`}
                                                hover
                                            >
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={600} data-testid={`text-workflow-name-${wf.id}`}>
                                                            {wf.name || wf.id}
                                                        </Typography>
                                                        {wf.description && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                {wf.description}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    {statusConf ? (
                                                        <Chip
                                                            icon={statusConf.icon}
                                                            label={statusConf.label}
                                                            color={statusConf.color}
                                                            size="small"
                                                            variant="outlined"
                                                            data-testid={`status-workflow-${wf.id}`}
                                                        />
                                                    ) : (
                                                        <Typography variant="caption" color="text.secondary">
                                                            No executions
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="caption">
                                                        {formatDateTime(latestExec?.started ?? latestExec?.created)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="caption">
                                                        {latestExec ? formatDuration(latestExec.started, latestExec.finished) : "—"}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="caption" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                                                        {latestExec?.id ? latestExec.id.substring(0, 12) + "..." : "—"}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {executions.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                Recent Executions
                            </Typography>
                            <TableContainer>
                                <Table size="small" data-testid={`table-executions-${workspace}`}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600 }}>Execution ID</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Workflow</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Started</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Finished</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {executions.slice(0, 20).map((exec) => {
                                            const statusConf = getStatusConfig(exec.run_status);
                                            const wf = workflows.find((w) => w.id === exec.workflow_id);

                                            return (
                                                <TableRow
                                                    key={exec.id}
                                                    data-testid={`row-execution-${exec.id}`}
                                                    hover
                                                >
                                                    <TableCell>
                                                        <Typography variant="caption" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                                                            {exec.id ? exec.id.substring(0, 16) : "—"}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {exec.workflow_name || wf?.name || exec.workflow_id || "—"}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            icon={statusConf.icon}
                                                            label={statusConf.label}
                                                            color={statusConf.color}
                                                            size="small"
                                                            variant="outlined"
                                                            data-testid={`status-execution-${exec.id}`}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="caption">
                                                            {formatDateTime(exec.started ?? exec.created)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="caption">
                                                            {formatDateTime(exec.finished)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="caption">
                                                            {formatDuration(exec.started, exec.finished)}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {executions.length > 20 && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                                    Showing 20 of {executions.length} executions
                                </Typography>
                            )}
                        </Box>
                    )}
                </Box>
            )}
        </Paper>
    );
};

export default Dashboard;
