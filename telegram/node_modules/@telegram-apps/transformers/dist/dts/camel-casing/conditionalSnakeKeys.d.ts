import { TransformAction } from 'valibot';
import { DeepConvertSnakeKeysToCamelCase, If } from '@telegram-apps/toolkit';
export type ConditionalSnakeKeysAction<Input extends object, CamelCase extends boolean> = TransformAction<Input, If<CamelCase, DeepConvertSnakeKeysToCamelCase<Input>, Input>>;
/**
 * Conditionally applies `deepSnakeToCamelObjKeys` to the input.
 * @param camelCase - true if the camel-casing must be applied.
 */
export declare function conditionalSnakeKeys<Input extends object>(camelCase?: boolean): ConditionalSnakeKeysAction<Input, false>;
/**
 * Conditionally applies `deepSnakeToCamelObjKeys` to the input.
 * @param camelCase - true if the camel-casing must be applied.
 */
export declare function conditionalSnakeKeys<Input extends object>(camelCase: true): ConditionalSnakeKeysAction<Input, true>;
