/**
 * Target origin used by the `postEvent` method.
 *
 * You don't need to override this value until you know what you are doing.
 * @default 'https://web.telegram.org'
 */
export declare const targetOrigin: import('@telegram-apps/signals').Signal<string>;
/**
 * Sets a new target origin that is being used when calling the `postEvent` function in Telegram
 * web versions.
 * @param origin - allowed target origin value.
 * @see targetOrigin
 */
export declare function setTargetOrigin(origin: string): void;
