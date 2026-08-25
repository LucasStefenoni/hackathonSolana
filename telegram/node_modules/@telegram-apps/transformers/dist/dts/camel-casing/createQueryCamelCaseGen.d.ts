import { BaseIssue, BaseSchema, InferOutput, InstanceSchema, SchemaWithPipe, StringSchema, UnionSchema } from 'valibot';
import { ConditionalSnakeKeysAction } from './conditionalSnakeKeys.js';
import { CamelCaseTransformerFn } from './types.js';
import { TransformQueryUsingAction } from '../transformers/transformQueryUsing.js';
type RequiredSchema = BaseSchema<object, object, BaseIssue<unknown>>;
export type CamelCaseQueryTransformerPipe<Schema extends RequiredSchema, CamelCase extends boolean> = SchemaWithPipe<[
    UnionSchema<[
        StringSchema<undefined>,
        InstanceSchema<typeof URLSearchParams, undefined>
    ], undefined>,
    TransformQueryUsingAction<Schema>,
    ConditionalSnakeKeysAction<InferOutput<Schema>, CamelCase>
]>;
export type CamelCaseQueryTransformer<Schema extends RequiredSchema> = CamelCaseTransformerFn<CamelCaseQueryTransformerPipe<Schema, false>, CamelCaseQueryTransformerPipe<Schema, true>>;
/**
 * Creates a transformer accepting query parameters as string and returning a value based
 * on the passed schema.
 * @param schema - schema to use to transform the output
 */
export declare function createQueryCamelCaseGen<Schema extends RequiredSchema>(schema: Schema): CamelCaseQueryTransformer<Schema>;
export {};
