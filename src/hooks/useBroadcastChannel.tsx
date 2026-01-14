import { useContext } from "react";

import BroadcastChannelContext from "../contexts/broadcastChannelContext";

/**
 * useBroadcastChannel
 *
 * Convenience hook that reads the broadcast channel API from `BroadcastChannelContext`.
 *
 * Behavior:
 * - Returns the context value exposed by `<BroadcastChannelProvider>`, typically including:
 *   - `post(message)` to publish messages
 *   - `subscribe(fn)` to listen for messages (returns an unsubscribe function)
 *   - `lastMessage` as the latest received message snapshot (if provided by the context)
 *
 * Error handling:
 * - Throws a descriptive error if invoked outside of a `<BroadcastChannelProvider>` scope, to fail fast
 *   and prevent silent no-op subscriptions or missing cross-tab communication.
 *
 * Usage:
 * ```ts
 * const { subscribe, post } = useBroadcastChannel();
 *
 * useEffect(() => {
 *   const unsub = subscribe((msg) => console.log(msg));
 *   return unsub;
 * }, [subscribe]);
 *
 * post({ type: "PING", payload: { at: Date.now() } });
 * ```
 *
 * @throws {Error}
 *  Throws if the hook is used outside of `<BroadcastChannelProvider>`.
 */

const useBroadcastChannel = () => {
    const context = useContext(BroadcastChannelContext);
    if (!context) throw new Error("useBroadcast must be used within <BroadcastProvider>.");
    return context;
}

export default useBroadcastChannel; 