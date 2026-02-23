import { useState, useMemo, useCallback, type ReactElement } from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
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

import useFetchWorkspaces from "../../hooks/useFetchWorkspaces";
import useFetchWorkflows from "../../hooks/useFetchWorkflows";
import useFetchWorkflowExecutions from "../../hooks/useFetchWorkflowExecutions";
import type { WorkflowExecution, WorkflowExecutionStatus } from "../../types/workflow";
const STATUS_CONFIG: Record<string, { color: "success" | "error" | "warning" | "info" | "default"; icon: ReactElement; label: string }> = {
    SUCCEEDED: { color: "success", icon: <CheckCircleIcon fontSize="small" />, label: "Succeeded" },
    FAILED: { color: "error", icon: <ErrorIcon fontSize="small" />, label: "Failed" },
    RUNNING: { color: "warning", icon: <PlayCircleIcon fontSize="small" />, label: "Running" },
    PENDING: { color: "info", icon: <HourglassEmptyIcon fontSize="small" />, label: "Pending" },
    CANCELLED: { color: "default", icon: <CancelIcon fontSize="small" />, label: "Cancelled" },
    COMPLETED: { color: "success", icon: <CheckCircleIcon fontSize="small" />, label: "Completed" },
};

const getStatusConfig = (status: WorkflowExecutionStatus) => {
    return STATUS_CONFIG[status] ?? { color: "default" as const, icon: <HourglassEmptyIcon fontSize="small" /> as ReactElement, label: status };
};

const formatDateTime = (dateStr: string | number | undefined | null): string => {
    if (!dateStr) return "—";
    try {
        const date = typeof dateStr === "number" ? new Date(dateStr * 1000) : new Date(dateStr);
        if (isNaN(date.getTime())) return String(dateStr);
        return date.toLocaleString();
    } catch {
        return String(dateStr);
    }
};

const formatDuration = (seconds: number | undefined | null): string => {
    if (seconds == null || seconds < 0) return "—";
    if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
};

interface SummaryCardProps {
    title: string;
    value: number;
    color: string;
    icon: ReactElement;
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
    const [refetchInterval, setRefetchInterval] = useState(30000);
    const [deselectedWorkspaces, setDeselectedWorkspaces] = useState<Set<string>>(new Set());

    const workspacesQuery = useFetchWorkspaces();
    const allWorkspaces = workspacesQuery.data ?? [];

    const visibleWorkspaces = useMemo(
        () => allWorkspaces.filter((ws) => !deselectedWorkspaces.has(ws.name)),
        [allWorkspaces, deselectedWorkspaces]
    );

    const handleToggleWorkspace = useCallback((name: string) => {
        setDeselectedWorkspaces((prev) => {
            const next = new Set(prev);
            if (next.has(name)) {
                next.delete(name);
            } else {
                next.add(name);
            }
            return next;
        });
    }, []);

    const handleSelectAll = useCallback(() => {
        setDeselectedWorkspaces(new Set());
    }, []);

    const handleDeselectAll = useCallback(() => {
        setDeselectedWorkspaces(new Set(allWorkspaces.map((ws) => ws.name)));
    }, [allWorkspaces]);

    return (
        <Box sx={{ maxWidth: 1400, mx: "auto", p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <DashboardIcon sx={{ fontSize: 32, color: "primary.main" }} />
                <Typography variant="h5" fontWeight={700} data-testid="text-dashboard-title">
                    Workflow Operations Dashboard
                </Typography>
            </Box>

            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                        Workspaces
                    </Typography>

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

                    <Tooltip title="Refresh workspaces">
                        <IconButton
                            data-testid="button-refresh-workspaces"
                            onClick={() => workspacesQuery.refetch()}
                            size="small"
                            disabled={workspacesQuery.isFetching}
                        >
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Box sx={{ flex: 1 }} />

                    <Typography
                        variant="caption"
                        color="primary"
                        sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                        onClick={handleSelectAll}
                        data-testid="link-select-all"
                    >
                        Select all
                    </Typography>
                    <Typography
                        variant="caption"
                        color="primary"
                        sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                        onClick={handleDeselectAll}
                        data-testid="link-deselect-all"
                    >
                        Deselect all
                    </Typography>
                </Box>

                {workspacesQuery.isLoading ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}>
                        <CircularProgress size={16} />
                        <Typography variant="body2" color="text.secondary">
                            Loading workspaces...
                        </Typography>
                    </Box>
                ) : allWorkspaces.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                        No workspaces found for this account.
                    </Typography>
                ) : (
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {allWorkspaces.map((ws) => (
                            <FormControlLabel
                                key={ws.name}
                                data-testid={`checkbox-workspace-${ws.name}`}
                                control={
                                    <Checkbox
                                        size="small"
                                        checked={!deselectedWorkspaces.has(ws.name)}
                                        onChange={() => handleToggleWorkspace(ws.name)}
                                    />
                                }
                                label={
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <Typography variant="body2">{ws.name}</Typography>
                                        {ws.group && (
                                            <Chip label={ws.group} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.7rem" }} />
                                        )}
                                    </Box>
                                }
                                sx={{ mr: 2 }}
                            />
                        ))}
                    </Box>
                )}
            </Paper>

            {visibleWorkspaces.length === 0 && !workspacesQuery.isLoading && allWorkspaces.length > 0 && (
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
                        No workspaces selected
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Select one or more workspaces above to view workflow execution statuses.
                    </Typography>
                </Paper>
            )}

            {visibleWorkspaces.map((ws) => (
                <WorkspaceSection
                    key={ws.name}
                    workspace={ws.name}
                    workspaceGroup={ws.group}
                    workspaceDescription={ws.description}
                    refetchInterval={refetchInterval}
                />
            ))}
        </Box>
    );
};

interface WorkspaceSectionProps {
    workspace: string;
    workspaceGroup: string | null;
    workspaceDescription: string;
    refetchInterval: number;
}

const WorkspaceSection = ({ workspace, workspaceGroup, workspaceDescription, refetchInterval }: WorkspaceSectionProps) => {
    const workflowsQuery = useFetchWorkflows({
        workspace,
        refetchInterval: refetchInterval || false,
        staleTime: 10000,
    });

    const workflows = workflowsQuery.data ?? [];

    const workflowIds = useMemo(
        () => workflows.map((wf) => wf.id),
        [workflows]
    );

    const executionsResult = useFetchWorkflowExecutions({
        workflowIds,
        enabled: workflowIds.length > 0,
        refetchInterval: refetchInterval || false,
        staleTime: 10000,
    });

    const isLoading = workflowsQuery.isLoading || (workflowIds.length > 0 && executionsResult.isLoading);
    const isFetching = workflowsQuery.isFetching || executionsResult.isFetching;

    const executions = executionsResult.data;

    const sortedExecutions = useMemo(() => {
        return [...executions].sort((a, b) => (b.created ?? 0) - (a.created ?? 0));
    }, [executions]);

    const latestExecutionByWorkflow = useMemo(() => {
        const map = new Map<string, WorkflowExecution>();
        for (const exec of executions) {
            const wfId = exec.workflow_id;
            if (!wfId) continue;
            const existing = map.get(wfId);
            if (!existing || exec.created > existing.created) {
                map.set(wfId, exec);
            }
        }
        return map;
    }, [executions]);

    const statusCounts = useMemo(() => {
        const counts = { total: executions.length, SUCCEEDED: 0, FAILED: 0, RUNNING: 0, PENDING: 0, CANCELLED: 0, OTHER: 0 };
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
        executionsResult.refetch();
    }, [workflowsQuery, executionsResult]);

    return (
        <Paper variant="outlined" sx={{ mb: 3, overflow: "hidden" }} data-testid={`section-workspace-${workspace}`}>
            {isFetching && <LinearProgress sx={{ height: 2 }} />}

            <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid", borderColor: "divider" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="h6" fontWeight={600} data-testid={`text-workspace-name-${workspace}`}>
                        {workspace}
                    </Typography>
                    {workspaceGroup && (
                        <Chip label={workspaceGroup} size="small" variant="outlined" />
                    )}
                    {workspaceDescription && (
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            {workspaceDescription}
                        </Typography>
                    )}
                </Box>
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
                            title="Succeeded"
                            value={statusCounts.SUCCEEDED}
                            color="#2e7d32"
                            icon={<CheckCircleIcon />}
                            testId={`card-succeeded-${workspace}`}
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
                                        <TableCell sx={{ fontWeight: 600 }}>Latest Run Status</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Trigger</TableCell>
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
                                                        {latestExec?.trigger ?? "—"}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="caption">
                                                        {formatDateTime(latestExec?.started ?? latestExec?.created)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="caption">
                                                        {latestExec ? formatDuration(latestExec.duration) : "—"}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="caption" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                                                        {latestExec?.id ? latestExec.id.substring(0, 16) + "..." : "—"}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {sortedExecutions.length > 0 && (
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
                                            <TableCell sx={{ fontWeight: 600 }}>Run Status</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Trigger</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Started</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {sortedExecutions.slice(0, 20).map((exec) => {
                                            const runStatusConf = getStatusConfig(exec.run_status);
                                            const statusConf = getStatusConfig(exec.status);

                                            return (
                                                <TableRow
                                                    key={exec.id}
                                                    data-testid={`row-execution-${exec.id}`}
                                                    hover
                                                >
                                                    <TableCell>
                                                        <Typography variant="caption" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                                                            {exec.id ? exec.id.substring(0, 20) : "—"}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {exec.workflow_name || exec.workflow_id || "—"}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            icon={statusConf.icon}
                                                            label={statusConf.label}
                                                            color={statusConf.color}
                                                            size="small"
                                                            variant="outlined"
                                                            data-testid={`status-exec-status-${exec.id}`}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            icon={runStatusConf.icon}
                                                            label={runStatusConf.label}
                                                            color={runStatusConf.color}
                                                            size="small"
                                                            variant="outlined"
                                                            data-testid={`status-exec-run-${exec.id}`}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="caption">
                                                            {exec.trigger ?? "—"}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="caption">
                                                            {formatDateTime(exec.started ?? exec.created)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="caption">
                                                            {formatDuration(exec.duration)}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {sortedExecutions.length > 20 && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                                    Showing 20 of {sortedExecutions.length} executions
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
