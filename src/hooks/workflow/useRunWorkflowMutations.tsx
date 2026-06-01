import { useMutation } from "@tanstack/react-query";

import useAxios from "@src/hooks/useAxios";
import useAppAlert from "@src/hooks/useAppAlert";
import type { DefaultObject } from "@src/types/defaultObject";
import type { PollWorkflowExecutionOptions } from "@src/utils/api/workflow";
import { runWorkflow, runWorkflowAndGetResult } from "@src/utils/api/workflow";

type RunWorkflowProps = {
    id: string;
    workspace: string;
    parameters: DefaultObject;
    pollOptions?: PollWorkflowExecutionOptions;
};

const getErrorMessage = (err: unknown, fallback: string) =>
    err instanceof Error && err.message ? err.message : fallback;

/**
 * useWorkflowRunMutations
 *
 * TanStack Query mutations to run a workflow. Synchronous execution (`synchronous: true`) is
 * intentionally not used; instead the workflow is started asynchronously and, when the result
 * is needed, its execution is polled until it reaches a terminal state.
 *
 * - `runAsync`: starts the workflow and returns immediately (fire-and-forget). Use when you do
 *   not need to wait for completion or consume the output.
 * - `runAndGetResult`: starts the workflow, polls until it finishes, then fetches the output of
 *   the ender worker. Resolves with `{ execution, workerExecution, result }`; `result` is `null`
 *   when the workflow produces no output. This is the replacement for the old synchronous flow.
 *
 * Both surface the standard mutation helpers (`mutate`, `mutateAsync`, `isPending`, `data`, ...)
 * and report failures through `useAppAlert`.
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

    const runAndGetResult = useMutation({
        mutationFn: ({ id, workspace, parameters, pollOptions }: RunWorkflowProps) =>
            runWorkflowAndGetResult(api, id, workspace, parameters, pollOptions),
        onError: (err) => {
            showAlert({
                severity: "error",
                message: getErrorMessage(err, "Unable to run the workflow. Please try again."),
            });
        },
    });

    return { runAsync, runAndGetResult };
};

export default useWorkflowRunMutations;