import { useEffect, useRef } from "react";

import useBroadcastChannel from "@src/hooks/useBroadcastChannel";
import type { Message } from "@src/contexts/broadcastChannelContext/broadcastChannelType";

/**
 * useBroadcastSubscription
 *
 * High-level helper hook that subscribes to the BroadcastChannel on mount and unsubscribes on unmount.
 *
 * Why this exists:
 * - Enforces the correct subscription pattern (`useEffect` + cleanup).
 * - Prevents accidental multiple subscriptions from re-renders.
 * - Uses a ref-backed handler so the subscription does not need to be recreated when the callback identity changes.
 *
 * Parameters:
 * @param {(msg: Message) => void} handler
 *  Callback invoked for every received message. Filtering (e.g., by `msg.type`) is intentionally left
 *  to the consumer.
 *
 * Example:
 * ```ts
 * useBroadcastSubscription((msg) => {
 *   if (msg.type === "PING") {
 *     console.log("ping:", msg.payload);
 *   }
 * });
 * ```
 */
const useBroadcastSubscription = (handler: (msg: Message) => void) => {
    const { subscribe } = useBroadcastChannel();
    const handlerRef = useRef(handler);

    handlerRef.current = handler;

    useEffect(() => {
        const unsubscribe = subscribe((msg: Message) => handlerRef.current(msg));
        return unsubscribe;
    }, [subscribe]);
}

export default useBroadcastSubscription;
