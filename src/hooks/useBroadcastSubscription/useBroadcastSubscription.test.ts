import { renderHook, act } from "@testing-library/react";
import useBroadcastSubscription from "./index";
import type { Message } from "@src/contexts/broadcastChannelContext/broadcastChannelType";

type Subscriber = (msg: Message) => void;

const mocks = vi.hoisted(() => ({
    subscribe: vi.fn(),
}));

vi.mock("@src/hooks/useBroadcastChannel", () => ({
    default: () => ({ subscribe: mocks.subscribe }),
}));

const makeMessage = (type: string, payload: unknown = null): Message => ({
    type,
    payload,
} as Message);

beforeEach(() => {
    vi.clearAllMocks();
    mocks.subscribe.mockReturnValue(vi.fn());
});

it("subscribes to the channel on mount", () => {
    const handler = vi.fn();
    renderHook(() => useBroadcastSubscription(handler));
    expect(mocks.subscribe).toHaveBeenCalledOnce();
});

it("calls the handler when a message is received", () => {
    let captured: Subscriber | null = null;
    mocks.subscribe.mockImplementation((cb: Subscriber) => {
        captured = cb;
        return vi.fn();
    });

    const handler = vi.fn();
    renderHook(() => useBroadcastSubscription(handler));

    act(() => { captured!(makeMessage("PING", "data")); });

    expect(handler).toHaveBeenCalledWith(makeMessage("PING", "data"));
});

it("unsubscribes on unmount", () => {
    const unsubscribe = vi.fn();
    mocks.subscribe.mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useBroadcastSubscription(vi.fn()));
    unmount();

    expect(unsubscribe).toHaveBeenCalledOnce();
});

it("always calls the latest handler without re-subscribing", () => {
    let captured: Subscriber | null = null;
    mocks.subscribe.mockImplementation((cb: Subscriber) => {
        captured = cb;
        return vi.fn();
    });

    const firstHandler = vi.fn();
    const secondHandler = vi.fn();

    const { rerender } = renderHook(
        ({ handler }: { handler: (msg: Message) => void }) => useBroadcastSubscription(handler),
        { initialProps: { handler: firstHandler } }
    );

    rerender({ handler: secondHandler });

    act(() => { captured!(makeMessage("UPDATE")); });

    expect(secondHandler).toHaveBeenCalledOnce();
    expect(firstHandler).not.toHaveBeenCalled();
    expect(mocks.subscribe).toHaveBeenCalledOnce();
});
