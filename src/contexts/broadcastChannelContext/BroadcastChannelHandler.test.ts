import { BroadcastChannelHandler } from "./broadcastChannelHandler";
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
    mockChannel?.onmessage?.({ data } as MessageEvent);

it("delivers incoming messages to registered listeners", () => {
    const handler = new BroadcastChannelHandler("test");
    const listener = vi.fn();
    handler.listen(listener);
    simulate({ type: "PING" });
    expect(listener).toHaveBeenCalledWith({ type: "PING" });
});

it("delivers to all registered listeners", () => {
    const handler = new BroadcastChannelHandler("test");
    const a = vi.fn();
    const b = vi.fn();
    handler.listen(a);
    handler.listen(b);
    simulate({ type: "PING" });
    expect(a).toHaveBeenCalledWith({ type: "PING" });
    expect(b).toHaveBeenCalledWith({ type: "PING" });
});

it("unsubscribe removes only that listener", () => {
    const handler = new BroadcastChannelHandler("test");
    const a = vi.fn();
    const b = vi.fn();
    const unsub = handler.listen(a);
    handler.listen(b);
    unsub();
    simulate({ type: "PING" });
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledWith({ type: "PING" });
});

it("sendMessage calls postMessage on the channel", () => {
    const handler = new BroadcastChannelHandler("test");
    handler.sendMessage({ type: "PING", payload: { at: 123 } });
    expect(mockChannel?.postMessage).toHaveBeenCalledWith({ type: "PING", payload: { at: 123 } });
});

it("close clears all listeners and closes the channel", () => {
    const handler = new BroadcastChannelHandler("test");
    const listener = vi.fn();
    handler.listen(listener);
    handler.close();
    simulate({ type: "PING" });
    expect(listener).not.toHaveBeenCalled();
    expect(mockChannel?.close).toHaveBeenCalled();
});
