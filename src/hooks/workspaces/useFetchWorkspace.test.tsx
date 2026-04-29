import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useFetchWorkspace from "./useFetchWorkspace";
import type { Workspace } from "@src/types/workspace";

const mocks = vi.hoisted(() => ({
    api: {},
    showAlert: vi.fn(),
    getWorkspace: vi.fn(),
}));

vi.mock("@src/hooks/useAxios", () => ({ default: () => ({ api: mocks.api }) }));
vi.mock("@src/hooks/useAppAlert", () => ({ default: () => ({ showAlert: mocks.showAlert }) }));
vi.mock("@src/utils/api/workspace", () => ({ getWorkspace: mocks.getWorkspace }));

const rawWorkspace: Workspace = {
    name: "main",
    group: null,
    description: "Main workspace",
    version: "1",
    created: 0,
    updated: 0,
};

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    return { Wrapper };
};

beforeEach(() => vi.clearAllMocks());

it("calls getWorkspace with the api and name", async () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkspace.mockResolvedValue(rawWorkspace);

    const { result } = renderHook(
        () => useFetchWorkspace({ name: "main" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.getWorkspace).toHaveBeenCalledWith(mocks.api, "main");
});

it("returns the workspace from the response", async () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkspace.mockResolvedValue(rawWorkspace);

    const { result } = renderHook(
        () => useFetchWorkspace({ name: "main" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(rawWorkspace);
});

it("returns the correct queryKey", () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkspace.mockResolvedValue(rawWorkspace);

    const { result } = renderHook(
        () => useFetchWorkspace({ name: "main" }),
        { wrapper: Wrapper }
    );

    expect(result.current.queryKey).toEqual(["workspace", "main"]);
});

it("shows an error alert when the query fails", async () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkspace.mockRejectedValue(new Error("Not found"));

    const { result } = renderHook(
        () => useFetchWorkspace({ name: "main" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    await waitFor(() =>
        expect(mocks.showAlert).toHaveBeenCalledWith({
            severity: "error",
            message: "Not found",
        })
    );
});

it("does not show an alert on success", async () => {
    const { Wrapper } = createWrapper();
    mocks.getWorkspace.mockResolvedValue(rawWorkspace);

    const { result } = renderHook(
        () => useFetchWorkspace({ name: "main" }),
        { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.showAlert).not.toHaveBeenCalled();
});
