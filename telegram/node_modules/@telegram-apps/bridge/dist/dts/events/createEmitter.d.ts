import { Handler } from 'mitt';
import { If, IsNever, IsUndefined, Or } from '@telegram-apps/toolkit';
export type WildcardHandler<E> = Handler<{
    [K in keyof E]: [K, If<Or<IsNever<E[K]>, IsUndefined<E[K]>>, void, E[K]>];
}[keyof E]>;
export interface OnFn<E> {
    /**
     * Adds a new listener for the specified event.
     * @param type - event name.
     * @param handler - event listener.
     * @param once - should listener be called only once.
     * @returns Function to remove bound event listener.
     */ <K extends keyof E>(type: K, handler: Handler<E[K]>, once?: boolean): VoidFunction;
    /**
     * Adds a listener for all events.
     * @param type - event name.
     * @param handler - event listener.
     * @param once - should listener be called only once.
     * @returns Function to remove bound event listener.
     */
    (type: '*', handler: WildcardHandler<E>, once?: boolean): VoidFunction;
}
export interface OffFn<E> {
    /**
     * Removes a listener for the specified event.
     * @param type - event to listen.
     * @param handler - event listener to remove.
     * @param once - had this listener to be called only once.
     */ <K extends keyof E>(type: K, handler: Handler<E[K]>, once?: boolean): void;
    /**
     * Removes a listener for all events.
     * @param type - event to stop listening.
     * @param handler - event listener to remove.
     * @param once - had this listener to be called only once.
     */
    (type: '*', handler: WildcardHandler<E>, once?: boolean): void;
}
export interface EmitFn<E> {
    <K extends keyof E>(type: K, event: E[K]): void;
    <K extends keyof E>(type: undefined extends E[K] ? K : never): void;
}
/**
 * Creates a new enhanced event emitter.
 * @param onFirst - will be called when the first event was added.
 * @param onEmpty - will be called when emitter's listeners' map was emptied.
 */
export declare function createEmitter<E extends object>(onFirst: VoidFunction, onEmpty: VoidFunction): [
    on: OnFn<E>,
    off: OffFn<E>,
    emit: EmitFn<E>,
    clear: VoidFunction
];
