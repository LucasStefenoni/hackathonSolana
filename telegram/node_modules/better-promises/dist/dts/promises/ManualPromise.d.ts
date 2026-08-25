import { AbortablePromise } from './AbortablePromise.js';
import { PromiseExecutorFn, PromiseOnRejectedFn, PromiseOnFulfilledFn, PromiseResolveFn, PromiseOptions, Maybe, WithFnFunction } from './types.js';
export declare class ManualPromise<T> extends AbortablePromise<T> {
    /**
     * Creates a new ManualPromise instance using an executor, resolving the promise when a result
     * was returned.
     * @param fn - function returning promise result.
     * @param options - additional options.
     */
    static fn<T>(fn: WithFnFunction<T>, options?: PromiseOptions): ManualPromise<T>;
    /**
     * @see Promise.resolve
     */
    static resolve(): ManualPromise<void>;
    /**
     * @see Promise.resolve
     */
    static resolve<T>(value: T | PromiseLike<T>): ManualPromise<Awaited<T>>;
    /**
     * @see Promise.reject
     */
    static reject<T = never>(reason?: any): ManualPromise<T>;
    /**
     * Creates a new ManualPromise instance using only options.
     * @param options - additional options.
     */
    constructor(options?: PromiseOptions);
    /**
     * Creates a new ManualPromise instance using specified executor and additional options.
     * @param executor - promise executor.
     * @param options - additional options.
     */
    constructor(executor?: PromiseExecutorFn<T>, options?: PromiseOptions);
    /**
     * @see Promise.catch
     */
    catch<CatchResult = never>(onRejected?: Maybe<PromiseOnRejectedFn<CatchResult>>): ManualPromise<T | CatchResult>;
    /**
     * @see Promise.finally
     */
    finally(onFinally?: Maybe<() => void>): ManualPromise<T>;
    /**
     * Resolves the promise.
     */
    resolve: PromiseResolveFn<T>;
    /**
     * @see Promise.then
     */
    then<A = T, B = never>(onFulfilled?: Maybe<PromiseOnFulfilledFn<T, A>>, onRejected?: Maybe<PromiseOnRejectedFn<B>>): ManualPromise<A | B>;
}
