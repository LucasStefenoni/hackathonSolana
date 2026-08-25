export type PromiseResolveResult<T> = [typeof RESOLVED_SYMBOL, T];
declare const RESOLVED_SYMBOL: unique symbol;
/**
 * @return True if passed value determines that the promise was resolved.
 * @param value
 * @example
 * const promise = new ManualPromise(async (res, rej, signal) => {
 *   // Imitate something async here.
 *   await new Promise(res => setTimeout(res, 1000));
 *
 *   if (isResolved(signal.reason)) {
 *     // It means that ManualPromise was resolved outside. We probably want to stop executing
 *     // the function as long as the result will not affect anything.
 *     return;
 *   }
 *
 *   // Otherwise keep doing what we do.
 * });
 */
export declare function isPromiseResolveResult(value: unknown): value is PromiseResolveResult<unknown>;
export declare function withResolved<T>(value: T): PromiseResolveResult<T>;
export {};
