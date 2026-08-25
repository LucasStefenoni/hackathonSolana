/**
 * Decodes a start parameter using a custom parser.
 * @param value - a start parameter value.
 * @param parse - a custom value parser.
 * @see decodeBase64Url
 */
export declare function decodeStartParam<T>(value: string, parse: (value: string) => T): T;
/**
 * Decodes a start parameter assuming that the result is a JSON value.
 * @param value - a start parameter value.
 * @param as - result kind.
 * @see decodeBase64Url
 */
export declare function decodeStartParam(value: string, as: 'json'): unknown;
/**
 * Decodes a start parameter and returns its decoded representation.
 * @param value - a value to decode.
 * @see decodeBase64Url
 */
export declare function decodeStartParam(value: string): string;
