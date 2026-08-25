"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.concatArgs = exports.arrayEqual = void 0;
/**
 * Check whether two sequences (e.g. Arrays of numbers) are equal.
 *
 * @param arr1 - One of the arrays to compare.
 * @param arr2 - The other array to compare.
 */
function arrayEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    let result = 0;
    for (let i = 0; i < arr1.length; i++) {
        // eslint-disable-next-line no-bitwise -- bitwise ops are required to avoid side-channel timing attacks
        result |= arr1[i] ^ arr2[i];
    }
    return result === 0;
}
exports.arrayEqual = arrayEqual;
/**
 * Check whether a value is a scalar
 *
 * @param val - The value to check.
 */
function isScalar(val) {
    return typeof val === 'number';
}
/**
 * Concatenate all `arguments` into a single array. Each argument can be either
 * a single element or a sequence, which has a `length` property and supports
 * element retrieval via sequence[ix].
 *
 * > concatArgs(1, [2, 3], Uint8Array.from([4,5]), new Uint8Array([6, 7]));
 * [1,2,3,4,5,6,7]
 *
 * @param args - Concatenate of these args into a single array.
 * @returns Array of concatenated arguments
 */
function concatArgs(...args) {
    return args.flatMap((arg) => {
        return isScalar(arg) ? [arg] : Array.from(arg);
    });
}
exports.concatArgs = concatArgs;
//# sourceMappingURL=utils.js.map