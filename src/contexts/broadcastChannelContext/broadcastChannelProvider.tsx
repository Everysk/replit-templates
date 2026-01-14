import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import BroadcastChannelContext from ".";
import { BroadcastChannelHandler } from "./broadcastChannelHandler";
import type { BroadcastChannelContextType, BroadcastChannelProviderProps, Message } from "./broadcastChannelType";

const APP_ID = window.APP_ID ?? "app_template";

/**
 * BroadcastChannelProvider
 *
 * React context provider that exposes a lightweight pub/sub API backed by the native `BroadcastChannel`
 * (via `BroadcastChannelHandler`). It is designed to support cross-tab (and same-origin) communication
 * while remaining safe under React 18 development behaviors (e.g., StrictMode double-mount) and
 * resilient to timing issues during initial mount.
 *
 * What this provider does:
 * - Creates a single `BroadcastChannelHandler` instance for the application (keyed by `APP_ID`).
 * - Exposes a context value with:
 *   - `post(message)` to publish messages to the channel
 *   - `subscribe(fn)` to register listeners and receive messages
 *   - `lastMessage` as a convenience snapshot of the most recently received message
 *
 * Why the "buffer" exists (`pendingRef`):
 * - The handler is created inside `useEffect`, which runs after the initial render commit.
 * - Consumers can call `subscribe` before the handler is ready (e.g., during early lifecycle
 *   or due to ordering of effects).
 * - To prevent losing subscriptions, we buffer callbacks in `pendingRef` and flush (register)
 *   them once the handler is created.
 *
 * Buffering behavior:
 * - If `subscribe(fn)` is called before the handler exists:
 *   - `fn` is stored in `pendingRef` with a `null` unsubscribe placeholder.
 *   - Once the handler is created, all pending callbacks are registered and their real unsubscribe
 *     functions are stored back into the map.
 * - The function returned by `subscribe` always performs proper cleanup:
 *   - If the callback was still pending, it is removed from the map.
 *   - If it was already registered, it calls the real unsubscribe and then removes it.
 *
 * Important notes:
 * - `APP_ID` is assumed static for the lifetime of the page (injected into `index.html` before bundle execution).
 * - `lastMessage` updates on every received message, which re-renders all context consumers that read the
 *   context value. For high-throughput channels, consider splitting state into a separate context or removing
 *   `lastMessage` entirely if not required.
 * - Consumers should subscribe inside `useEffect` and return the cleanup function to avoid accumulating listeners:
 *
 * Example:
 * ```ts
 * const { subscribe, post } = useBroadcastChannel();
 *
 * useEffect(() => {
 *   const unsub = subscribe((msg) => console.info("received:", msg));
 *   return unsub;
 * }, [subscribe]);
 *
 * post({ type: "PING", payload: { at: Date.now() } });
 * ```
 *
 * Provider value (BroadcastChannelContextType):
 * @returns {object}
 *  - `post(message: Message): void`
 *    Publishes a message to the underlying channel.
 *  - `subscribe(fn: (m: Message) => void): () => void`
 *    Registers a listener and returns an unsubscribe function.
 *    Subscription is buffered if the channel is not yet initialized.
 *  - `lastMessage: Message | null`
 *    The most recently received message (or null if none received yet).
 */

export const BroadcastChannelProvider = ({ children }: BroadcastChannelProviderProps) => {
    const handlerRef = useRef<BroadcastChannelHandler | null>(null);
    const [lastMessage, setLastMessage] = useState<Message | null>(null);

    const pendingRef = useRef(new Map<(m: Message) => void, (() => void) | null>());

    useEffect(() => {
        const channel = new BroadcastChannelHandler(APP_ID);
        handlerRef.current = channel;

        const unsubscribeProvider = channel.listen((message) => setLastMessage(message));

        const pending = pendingRef.current;

        for (const [fn, unsub] of pending.entries()) {
            if (!unsub) {
                const realUnsub = channel.listen(fn);
                pending.set(fn, realUnsub);
            }
        }

        return () => {
            unsubscribeProvider();
            channel.close();
            handlerRef.current = null;
            pending.clear();
        };
    }, []);


    const post = useCallback((message: Message) => {
        handlerRef.current?.sendMessage(message);
    }, []);

    const subscribe = useCallback((fn: (m: Message) => void) => {

        if (handlerRef.current) {
            return handlerRef.current.listen(fn);
        }

        pendingRef.current.set(fn, null);

        return () => {
            const maybeUnsub = pendingRef.current.get(fn);
            if (maybeUnsub) maybeUnsub();
            pendingRef.current.delete(fn);
        };
    }, []);

    const value: BroadcastChannelContextType = useMemo(
        () => ({ post, subscribe, lastMessage }),
        [post, subscribe, lastMessage]
    );

    return <BroadcastChannelContext.Provider value={value}>{children}</BroadcastChannelContext.Provider>;
};
