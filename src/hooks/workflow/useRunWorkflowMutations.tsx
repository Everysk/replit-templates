import { useMutation } from "@tanstack/react-query";

import useAxios from "../useAxios";
import useAppAlert from "../useAppAlert";
import type { DefaultObject } from "../../types/defaultObject";
import { runWorkflow, runWorkflowSync } from "../../utils/api/workflow";

type RunWorkflowProps = {
    id: string;
    workspace: string;
    parameters: DefaultObject;
};

const getErrorMessage = (err: unknown, fallback: string) =>
    err instanceof Error && err.message ? err.message : fallback;

/**
 * useWorkflowMutations
 *
 * Mutation hook built on TanStack Query to run Workflow executions:
 * - run a workflow asynchronously (POST /workflows/:id/run)
 * - run a workflow synchronously (POST /workflows/:id/run with `synchronous: true`)
 *
 * It also:
 * - displays success/error alerts via `useAppAlert`
 *
 * Important notes:
 * - Workflow execution is a side-effect operation, so it should be modeled as a mutation (not a query).
 * - `runSync` returns the execution response immediately. If you need the execution output/result,
 *   prefer `runSync` when available.
 * - `runAsync` may return an execution reference with a non-terminal status. If you need final output
 *   for async executions, you typically need an additional endpoint to poll execution status/result.
 *
 * Mutations:
 * - `runAsync`:
 *   - mutationFn: `runWorkflow(api, id, workspace, parameters)`
 *   - variables: `{ id: string; workspace: string; parameters: DefaultObject }`
 *   - success message: "Workflow started successfully."
 *   - error message: "Unable to start the workflow. Please try again." (fallback)
 *
 * - `runSync`:
 *   - mutationFn: `runWorkflowSync(api, id, workspace, parameters)`
 *   - variables: `{ id: string; workspace: string; parameters: DefaultObject }`
 *   - success message: "Workflow completed successfully."
 *   - error message: "Unable to run the workflow. Please try again." (fallback)
 *
 * Return value:
 * @returns {object}
 *  Returns an object with two TanStack Query mutation results:
 *  - `runAsync`: UseMutationResult<DefaultObject, Error, RunWorkflowProps, unknown>
 *  - `runSync`: UseMutationResult<DefaultObject, Error, RunWorkflowProps, unknown>
 *
 * Each mutation includes standard TanStack Query helpers:
 * - `mutate(variables, options?)`
 * - `mutateAsync(variables, options?)`
 * - `isPending`, `isSuccess`, `isError`, `error`, `data`, etc.
 *
 * Examples:
 *
 * 1) Start a workflow asynchronously:
 * ```ts
 * const { runAsync } = useWorkflowMutations();
 *
 * runAsync.mutate({
 *   id: "wf-123",
 *   workspace: "ws-1",
 *   parameters: { UID: "ABC123" },
 * });
 * ```
 *
 * 2) Run a workflow synchronously and capture the result:
 * ```ts
 * const { runSync } = useWorkflowMutations();
 *
 * const result = await runSync.mutateAsync({
 *   id: "wf-123",
 *   workspace: "ws-1",
 *   parameters: { UID: "ABC123" },
 * });
 *
 * console.log(result); // execution output/response
 * ```
 *
 * 3) Custom behavior per call:
 * ```ts
 * const { runSync } = useWorkflowMutations();
 *
 * await runSync.mutateAsync(
 *   { id: "wf-123", workspace: "ws-1", parameters: {} },
 *   {
 *     onSuccess: (data) => {
 *       // e.g., route to a result page, open a dialog, etc.
 *     },
 *   }
 * );
 * ```
 */

const useWorkflowRunMutations = () => {
    const { api } = useAxios();
    const { showAlert } = useAppAlert();

    const runAsync = useMutation({
        mutationFn: ({ id, workspace, parameters }: RunWorkflowProps) =>
            runWorkflow(api, id, workspace, parameters),
        onError: (err) => {
            showAlert({
                severity: "error",
                message: getErrorMessage(err, "Unable to run the workflow. Please try again."),
            });
        },
    });

    const runSync = useMutation({
        mutationFn: ({ id, workspace, parameters }: RunWorkflowProps) =>
            runWorkflowSync(api, id, workspace, parameters),
        onError: (err) => {
            showAlert({
                severity: "error",
                message: getErrorMessage(err, "Unable to run the workflow. Please try again."),
            });
        },
    });

    return { runAsync, runSync };
};

export default useWorkflowRunMutations;