import { CheckAction, NumberSchema, RecordSchema, SchemaWithPipe, StringSchema, TransformAction, UnionSchema } from 'valibot';
import { RGB, KnownThemeParamsKey } from '@telegram-apps/types';
import { CamelCaseTransformer } from '../camel-casing/createCamelCaseGen.js';
export declare const themeParams: CamelCaseTransformer<RecordSchema<SchemaWithPipe<[StringSchema<undefined>, TransformAction<string, KnownThemeParamsKey>]>, SchemaWithPipe<[UnionSchema<[StringSchema<undefined>, NumberSchema<undefined>], any>, TransformAction<string | number, string>, CheckAction<RGB, undefined>]>, undefined>>;
