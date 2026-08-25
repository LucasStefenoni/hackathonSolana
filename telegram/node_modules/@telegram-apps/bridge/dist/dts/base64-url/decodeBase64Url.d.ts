/**
 * Decodes a base-64-url ASCII string.
 * @param value - the value to decode.
 * @throws {DOMException} If the passed value is an invalid base64url string.
 * @see Learn more about base64url:
 * https://herongyang.com/Encoding/Base64URL-Encoding-Algorithm.html
 * @see Source:
 * https://developer.mozilla.org/ru/docs/Glossary/Base64#solution_1_–_escaping_the_string_before_encoding_it
 */
export declare function decodeBase64Url(value: string): string;
