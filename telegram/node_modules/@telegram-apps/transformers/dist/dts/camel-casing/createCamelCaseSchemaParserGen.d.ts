import { BaseIssue, BaseSchema, InferOutput } from 'valibot';
import { DeepConvertSnakeKeysToCamelCase } from '@telegram-apps/toolkit';
export interface CamelCaseSchemaParser<Input, Output extends object> {
    (input: Input, camelCase?: false): Output;
    (input: Input, camelCase: true): DeepConvertSnakeKeysToCamelCase<Output>;
}
export declare function createCamelCaseSchemaParserGen<Input, Schema extends BaseSchema<Input, object, BaseIssue<unknown>>>(schema: Schema): CamelCaseSchemaParser<Input, InferOutput<Schema>>;
