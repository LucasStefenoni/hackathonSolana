import { BaseIssue, BaseSchema, SchemaWithPipe, StringSchema, TransformAction } from 'valibot';
import { CamelCaseTransformerPipe } from './createCamelCaseGen.js';
import { CamelCaseTransformerFn } from './types.js';
type RequiredSchema = BaseSchema<unknown, object, BaseIssue<unknown>>;
export type CamelCaseJsonTransformerPipe<Schema extends RequiredSchema, CamelCase extends boolean> = SchemaWithPipe<[
    StringSchema<undefined>,
    TransformAction<string, unknown>,
    CamelCaseTransformerPipe<Schema, CamelCase>
]>;
export type CamelCaseJsonTransformer<Schema extends RequiredSchema> = CamelCaseTransformerFn<CamelCaseJsonTransformerPipe<Schema, false>, CamelCaseJsonTransformerPipe<Schema, true>>;
/**
 * Creates a transformer accepting a JSON object presented as string and returning a value based
 * on the passed schema.
 * @param schema - schema to use to transform the output
 */
export declare function createJsonCamelCaseGen<Schema extends RequiredSchema>(schema: Schema): CamelCaseJsonTransformer<Schema>;
export {};
