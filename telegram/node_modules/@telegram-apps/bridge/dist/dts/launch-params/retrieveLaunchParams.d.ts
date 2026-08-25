import { LaunchParamsSchema } from '@telegram-apps/transformers';
import { DeepConvertSnakeKeysToCamelCase } from '@telegram-apps/toolkit';
import { InferOutput } from 'valibot';
export type RetrieveLPResult = InferOutput<typeof LaunchParamsSchema>;
export type RetrieveLPResultCamelCased = DeepConvertSnakeKeysToCamelCase<InferOutput<typeof LaunchParamsSchema>>;
/**
 * @returns Launch parameters from any known source.
 * @param camelCase - should the output be camel-cased.
 * @throws {LaunchParamsRetrieveError} Unable to retrieve launch parameters. They are probably
 * invalid.
 */
export declare function retrieveLaunchParams(camelCase?: false): RetrieveLPResult;
/**
 * @returns Launch parameters from any known source.
 * @param camelCase - should the output be camel-cased.
 * @throws {LaunchParamsRetrieveError} Unable to retrieve launch parameters. They are probably
 * invalid.
 */
export declare function retrieveLaunchParams(camelCase: true): RetrieveLPResultCamelCased;
