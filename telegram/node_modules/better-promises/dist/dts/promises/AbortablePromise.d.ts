import { PromiseExecutorFn, PromiseOnRejectedFn, PromiseRejectFn, PromiseOnFulfilledFn, PromiseOptions, Maybe, WithFnFunction } from './types.js';
/**
 * Improved version of the JavaScript Promise.
 */
export declare class AbortablePromise<Result> extends Promise<Result> {
    /**
     * Creates a new AbortablePromise instance using an executor, resolving the promise when a result
     * was returned.
     * @param fn - function returning promise result.
     * @param options - additional options.
     */
    static fn<T>(fn: WithFnFunction<T>, options?: PromiseOptions): AbortablePromise<T>;
    /**
     * @see Promise.resolve
     */
    static resolve(): AbortablePromise<void>;
    /**
     * @see Promise.resolve
     */
    static resolve<T>(value: T | PromiseLike<T>): AbortablePromise<Awaited<T>>;
    /**
     * @see Promise.reject
     */
    static reject<T = never>(reason?: any): AbortablePromise<T>;
    /**
     * Creates a new AbortablePromise instance using only options.
     * @param options - additional options.
     */
    constructor(options?: PromiseOptions);
    /**
     * Creates a new AbortablePromise instance using specified executor and additional options.
     * @param executor - promise executor.
     * @param options - additional options.
     */
    constructor(executor?: PromiseExecutorFn<Result>, options?: PromiseOptions);
    /**
     * Aborts the promise execution using the specified reason.
     *
     * Not that this method doesn't reject the promise but notifies the executor using its context.
     * To perform the same operation but also reject the promise, use the `reject()` method.
     * @param reason - abort reason.
     * @see reject
     */
    abort: (reason?: unknown) => void;
    /**
     * Aborts the promise with the cancel error.
     */
    cancel(): void;
    /**
     * @see Promise.catch
     */
    catch<CatchResult = never>(onRejected?: Maybe<PromiseOnRejectedFn<CatchResult>>): AbortablePromise<Result | CatchResult>;
    /**
     * @see Promise.finally
     */
    finally(onFinally?: Maybe<() => void>): AbortablePromise<Result>;
    /**
     * Rejects the initially created promise.
     *
     * This method not only aborts the signal passed to the executor, but also rejects the
     * promise itself calling all chained listeners.
     *
     * The reason passed to the method is being passed as-is to the executor's context.
     */
    reject: PromiseRejectFn;
    /**
     * @see Promise.then
     */
    then<A = Result, B = never>(onFulfilled?: Maybe<PromiseOnFulfilledFn<Result, A>>, onRejected?: Maybe<PromiseOnRejectedFn<B>>): AbortablePromise<A | B>;
}
