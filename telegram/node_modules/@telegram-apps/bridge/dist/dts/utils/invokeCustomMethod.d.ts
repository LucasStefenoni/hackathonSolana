import { AbortablePromise } from 'better-promises';
import { CustomMethodName, CustomMethodParams } from '../methods/types/index.js';
import { RequestOptions } from './request.js';
export type InvokeCustomMethodOptions = Omit<RequestOptions<'custom_method_invoked'>, 'capture'>;
export type InvokeCustomMethodFn = typeof invokeCustomMethod;
/**
 * Invokes known custom method. Returns method execution result.
 * @param method - method name.
 * @param params - method parameters.
 * @param requestId - request identifier.
 * @param options - additional options.
 * @throws {InvokeCustomMethodError} Invocation completed with some error.
 */
export declare function invokeCustomMethod<M extends CustomMethodName>(method: M, params: CustomMethodParams<M>, requestId: string, options?: InvokeCustomMethodOptions): AbortablePromise<unknown>;
/**
 * Invokes unknown custom method. Returns method execution result.
 * @param method - method name.
 * @param params - method parameters.
 * @param requestId - request identifier.
 * @param options - additional options.
 * @throws {InvokeCustomMethodError} Invocation completed with some error.
 */
export declare function invokeCustomMethod(method: string, params: object, requestId: string, options?: InvokeCustomMethodOptions): AbortablePromise<unknown>;
