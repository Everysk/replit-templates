import { render, screen, act } from "@testing-library/react";
import { AgGridLicenseProvider } from "./agGridLicenseProvider";
import type { Message } from "@src/contexts/broadcastChannelContext/broadcastChannelType";

const mocks = vi.hoisted(() => {
    const mockSetLicenseKey = vi.fn();
    const mockPost = vi.fn();
    let capturedListener: ((msg: Message) => void) | undefined;
    const mockSubscribe = vi.fn((fn: (msg: Message) => void) => {
        capturedListener = fn;
        return vi.fn();
    });
    return {
        mockSetLicenseKey,
        mockPost,
        mockSubscribe,
        getListener: () => capturedListener,
    };
});

vi.mock("ag-grid-enterprise", () => ({
    LicenseManager: { setLicenseKey: mocks.mockSetLicenseKey },
}));

vi.mock("@src/hooks/useBroadcastChannel", () => ({
    default: () => ({
        subscribe: mocks.mockSubscribe,
        post: mocks.mockPost,
        lastMessage: null,
    }),
}));

beforeEach(() => {
    vi.clearAllMocks();
});

afterEach(() => {
    vi.unstubAllEnvs();
});

it("renders children immediately in DEV mode", async () => {
    render(
        <AgGridLicenseProvider>
            <span>child content</span>
        </AgGridLicenseProvider>
    );
    expect(await screen.findByText("child content")).toBeInTheDocument();
});

it("shows loading screen in production mode while awaiting license", async () => {
    vi.stubEnv("DEV", false);
    render(
        <AgGridLicenseProvider>
            <span>child content</span>
        </AgGridLicenseProvider>
    );
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.queryByText("child content")).not.toBeInTheDocument();
});

it("posts REQUEST_AG_GRID_LICENSE after mounting", async () => {
    render(
        <AgGridLicenseProvider>
            <span>child content</span>
        </AgGridLicenseProvider>
    );
    await vi.waitFor(() =>
        expect(mocks.mockPost).toHaveBeenCalledWith({ type: "REQUEST_AG_GRID_LICENSE" })
    );
});

it("calls setLicenseKey and renders children when SEND_AG_GRID_LICENSE is received", async () => {
    vi.stubEnv("DEV", false);
    render(
        <AgGridLicenseProvider>
            <span>child content</span>
        </AgGridLicenseProvider>
    );

    await vi.waitFor(() => expect(mocks.mockSubscribe).toHaveBeenCalled());

    act(() => {
        mocks.getListener()?.({
            type: "SEND_AG_GRID_LICENSE",
            payload: { license: "key-123" },
        });
    });

    expect(mocks.mockSetLicenseKey).toHaveBeenCalledWith("key-123");
    expect(await screen.findByText("child content")).toBeInTheDocument();
});

it("ignores messages with the wrong type", async () => {
    vi.stubEnv("DEV", false);
    render(
        <AgGridLicenseProvider>
            <span>child content</span>
        </AgGridLicenseProvider>
    );

    await vi.waitFor(() => expect(mocks.mockSubscribe).toHaveBeenCalled());

    act(() => {
        mocks.getListener()?.({ type: "SOME_OTHER_EVENT", payload: { license: "key-123" } });
    });

    expect(mocks.mockSetLicenseKey).not.toHaveBeenCalled();
    expect(screen.queryByText("child content")).not.toBeInTheDocument();
});

