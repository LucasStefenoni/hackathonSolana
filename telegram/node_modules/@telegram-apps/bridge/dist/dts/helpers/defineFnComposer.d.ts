/**
 * Defines a property, that is a functions compose. Trying to set a value in this property
 * will lead to adding it to a function's pool. The property value will always be equal to a
 * function, calling all collected functions in the pool.
 *
 * Returned function performs a cleanup. It does one of the following:
 * 1. Removes the property if no functions were to the pool added other than the initial one.
 * 2. Sets the value equal to the first added function to the pool after the initial one if
 * the only one additional function was added at all. In other words, if the pool length is equal
 * to 2, the second item will be selected as the property value.
 * 3. Leaves the value equal to a function calling all pool functions, but removes the initially
 * added one.
 * @param obj - object.
 * @param prop - object property.
 * @param initialFn - an initial function to set.
 */
export declare function defineFnComposer(obj: any, prop: string, initialFn: (...args: any) => any): void;
