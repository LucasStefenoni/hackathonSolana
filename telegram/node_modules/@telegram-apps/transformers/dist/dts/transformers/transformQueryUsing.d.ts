import { BaseIssue, BaseSchema, InferOutput, TransformAction } from 'valibot';
export type TransformQueryUsingAction<Schema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>> = TransformAction<string | URLSearchParams, InferOutput<Schema>>;
export declare function transformQueryUsing<Schema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(schema: Schema): TransformQueryUsingAction<Schema>;
