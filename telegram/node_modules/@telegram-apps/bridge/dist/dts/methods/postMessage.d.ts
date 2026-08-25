export type PostMessage = typeof window.parent.postMessage;
/**
 * Signal containing a custom implementation of the method to post a message to the parent
 * window. We usually use it to send a message in web versions of Telegram.
 *
 * Initially, this value contains a function behaving like the `window.parent.postMessage` method.
 */
export declare const postMessageImplementation: import('@telegram-apps/signals').Signal<{
    (message: any, targetOrigin: string, transfer?: Transferable[]): void;
    (message: any, options?: WindowPostMessageOptions): void;
}>;
/**
 * Posts a message to the parent window. We usually use it to send a message in web versions of
 * Telegram.
 * @param args - `window.parent.postMessage` arguments.
 */
export declare const postMessage: PostMessage;
