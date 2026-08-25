/**
 * Creates a safe start parameter value. If the value is not a string, the function applies
 * JSON.stringify to it, so make sure you are not passing an object with circular references.
 *
 * @param value - value to create start parameter from.
 * @throws {Error} If the value length is too big for the allowed one.
 * @see Learn more about start parameter:
 * https://docs.telegram-mini-apps.com/platform/start-parameter
 */
export declare function createStartParam(value: unknown): string;
