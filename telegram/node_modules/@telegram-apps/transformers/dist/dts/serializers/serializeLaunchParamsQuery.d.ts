import { LaunchParams } from '@telegram-apps/types';
import { InferOutput } from 'valibot';
import { LaunchParamsSchema } from '../schemas/LaunchParamsSchema.js';
export type LaunchParamsLike = InferOutput<typeof LaunchParamsSchema> | LaunchParams;
/**
 * Serializes the LaunchParamsQuery shape.
 * @param value - value to serialize.
 */
export declare function serializeLaunchParamsQuery(value: LaunchParamsLike): string;
