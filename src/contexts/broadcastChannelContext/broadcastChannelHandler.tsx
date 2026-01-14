import type { Message } from "./broadcastChannelType";

/**
 * BroadcastChannelHandler
 *
 * Minimal wrapper around the browser `BroadcastChannel` API that provides a small pub/sub layer.
 *
 * Features:
 * - Opens a `BroadcastChannel` instance with the provided channel `name`.
 * - Keeps an in-memory `Set` of subscribed callbacks (`_listeners`).
 * - For each incoming `BroadcastChannel` message, forwards the payload (`event.data`) to all listeners.
 *
 * API:
 * - `listen(callback)`:
 *   Registers a listener to receive incoming messages.
 *   Returns an unsubscribe function that removes the callback from the internal set.
 *
 * - `sendMessage(message)`:
 *   Publishes a message to the channel via `BroadcastChannel.postMessage`.
 *
 * - `close()`:
 *   Clears all listeners and closes the underlying channel. After calling `close()`, the handler
 *   should be considered unusable.
 *
 * Notes:
 * - The native `BroadcastChannel` delivers messages as a `MessageEvent`, but this handler exposes
 *   only the payload (`event.data`) to listeners, typed as `Message`.
 * - Message delivery is best-effort: if a listener throws, it can affect subsequent listeners unless
 *   callers ensure their callbacks are safe. If needed, wrap callbacks with try/catch at call sites.
 *
 * Example:
 * ```ts
 * const handler = new BroadcastChannelHandler("my-channel");
 *
 * const unsubscribe = handler.listen((msg) => {
 *   console.log("received:", msg);
 * });
 *
 * handler.sendMessage({ type: "PING", payload: { at: Date.now() } });
 *
 * unsubscribe();
 * handler.close();
 * ```
 */

export class BroadcastChannelHandler {
    private _channel: BroadcastChannel;
    private _listeners: Set<(msg: Message) => void> = new Set();

    constructor(name: string) {
        this._channel = new BroadcastChannel(name);

        this._channel.onmessage = (event: MessageEvent<Message>) => {
            const msg = event.data;
            this._listeners.forEach((callback) => callback(msg));
        };
    }

    listen(callback: (msg: Message) => void): () => void {
        this._listeners.add(callback);
        return () => this._listeners.delete(callback);
    }

    sendMessage(message: Message): void {
        this._channel.postMessage(message);
    }

    close(): void {
        this._listeners.clear();
        this._channel.close();
    }
}
