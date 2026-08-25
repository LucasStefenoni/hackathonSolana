/**
 * Converts the passed object to query parameters.
 * @param value - value to serialize.
 * @param onObject - function returning serialized object value.
 */
export declare function serializeToQuery(value: object, onObject?: (key: string, value: object) => string): string;
