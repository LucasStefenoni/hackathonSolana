import { BaseIssue, BaseSchema, InferOutput, SchemaWithPipe } from 'valibot';
import { ConditionalSnakeKeysAction } from './conditionalSnakeKeys.js';
import { CamelCaseTransformerFn } from './types.js';
type RequiredSchema = BaseSchema<unknown, object, BaseIssue<unknown>>;
export type CamelCaseTransformerPipe<Schema extends RequiredSchema, CamelCase extends boolean> = SchemaWithPipe<[
    Schema,
    ConditionalSnakeKeysAction<InferOutput<Schema>, CamelCase>
]>;
export type CamelCaseTransformer<Schema extends RequiredSchema> = CamelCaseTransformerFn<CamelCaseTransformerPipe<Schema, false>, CamelCaseTransformerPipe<Schema, true>>;
/**
 * Creates a function that generates schemas deeply camel-casing output keys if needed.
 * @param schema - base schema used to validate the input.
 */
export declare function createCamelCaseGen<Schema extends RequiredSchema>(schema: Schema): CamelCaseTransformer<Schema>;
export {};
