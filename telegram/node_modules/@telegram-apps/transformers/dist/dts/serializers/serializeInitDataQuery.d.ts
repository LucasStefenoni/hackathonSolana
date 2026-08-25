import { InferOutput } from 'valibot';
import { InitData } from '@telegram-apps/types';
import { InitDataQuerySchema } from '../schemas/init-data.js';
export type InitDataLike = InferOutput<typeof InitDataQuerySchema> | InitData;
/**
 * Serializes the InitDataQuery shape.
 * @param value - value to serialize.
 */
export declare function serializeInitDataQuery(value: InitDataLike): string;
