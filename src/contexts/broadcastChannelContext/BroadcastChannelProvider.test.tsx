import { useContext, useEffect } from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BroadcastChannelProvider } from "./broadcastChannelProvider";
import BroadcastChannelContext from "./index";
import type { Message } from "./broadcastChannelType";

let mockChannel: {
    onmessage: ((e: { data: Message }) => void) | null;
    postMessage: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
} | null = null;

beforeAll(() => {
    vi.stubGlobal(
        "BroadcastChannel",
        class {
            onmessage: ((e: { data: Message }) => void) | null = null;
            postMessage = vi.fn();
            close = vi.fn();
            constructor() {
                mockChannel = this as typeof mockChannel;
            }
        }
    );
});

afterAll(() => {
    vi.unstubAllGlobals();
});

beforeEach(() => {
    mockChannel = null;
    vi.clearAllMocks();
});

const simulate = (data: Message) =>
    act(() => {
        mockChannel?.onmessage?.({ data } as MessageEvent);
    });

// Consumer that calls subscribe in useEffect — runs before provider's effect (children-first),
// exercising the pending buffer that registers early subscribers when the handler mounts.
const buildSubscriber = (onMessage: (msg: Message) => void) => {
    const Subscriber = () => {
        const ctx = useContext(BroadcastChannelContext)!;
        useEffect(() => {
            return ctx.subscribe(onMessage);
        }, [ctx]);
        return null;
    };
    return Subscriber;
};

it("renders children", () => {
    render(
        <BroadcastChannelProvider>
            <span>child</span>
        </BroadcastChannelProvider>
    );
    expect(screen.getByText("child")).toBeInTheDocument();
});

it("subscriber receives messages sent via the channel", async () => {
    const received: Message[] = [];
    const Subscriber = buildSubscriber((msg) => received.push(msg));

    render(
        <BroadcastChannelProvider>
            <Subscriber />
        </BroadcastChannelProvider>
    );

    await simulate({ type: "PING", payload: { at: 1 } });

    expect(received).toEqual([{ type: "PING", payload: { at: 1 } }]);
});

it("multiple subscribers each receive the message", async () => {
    const a: Message[] = [];
    const b: Message[] = [];
    const A = buildSubscriber((m) => a.push(m));
    const B = buildSubscriber((m) => b.push(m));

    render(
        <BroadcastChannelProvider>
            <A />
            <B />
        </BroadcastChannelProvider>
    );

    await simulate({ type: "PING" });

    expect(a).toHaveLength(1);
    expect(b).toHaveLength(1);
});

it("lastMessage updates when a message is received", async () => {
    const Consumer = () => {
        const ctx = useContext(BroadcastChannelContext)!;
        return <span>{ctx.lastMessage?.type ?? "none"}</span>;
    };

    render(
        <BroadcastChannelProvider>
            <Consumer />
        </BroadcastChannelProvider>
    );

    expect(screen.getByText("none")).toBeInTheDocument();

    await simulate({ type: "UPDATE" });

    expect(screen.getByText("UPDATE")).toBeInTheDocument();
});

it("post sends the message via the channel", async () => {
    const user = userEvent.setup();

    const Consumer = () => {
        const ctx = useContext(BroadcastChannelContext)!;
        return (
            <button onClick={() => ctx.post({ type: "PONG" })}>send</button>
        );
    };

    render(
        <BroadcastChannelProvider>
            <Consumer />
        </BroadcastChannelProvider>
    );

    await user.click(screen.getByRole("button", { name: "send" }));

    expect(mockChannel?.postMessage).toHaveBeenCalledWith({ type: "PONG" });
});

it("closes the channel on unmount", () => {
    const { unmount } = render(
        <BroadcastChannelProvider>
            <span />
        </BroadcastChannelProvider>
    );

    unmount();

    expect(mockChannel?.close).toHaveBeenCalled();
});
