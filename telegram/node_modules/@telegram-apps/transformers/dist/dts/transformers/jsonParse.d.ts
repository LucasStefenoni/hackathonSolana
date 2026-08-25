import { TransformAction } from 'valibot';
export type JsonParseAction = TransformAction<string, unknown>;
/**
 * @returns A transformer applying `JSON.parse` to the input.
 */
export declare function jsonParse(): JsonParseAction;
