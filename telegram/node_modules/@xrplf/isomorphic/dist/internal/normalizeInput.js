"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_js_1 = require("@noble/hashes/utils.js");
/**
 * Normalize a string, number array, or Uint8Array to a Uint8Array.
 * Strings are converted to Uint8Array using UTF-8 encoding.
 *
 * @param input - value to normalize
 */
function normalizeInput(input) {
    if (Array.isArray(input)) {
        return new Uint8Array(input);
    }
    if (typeof input === 'string') {
        return (0, utils_js_1.utf8ToBytes)(input);
    }
    return input;
}
exports.default = normalizeInput;
//# sourceMappingURL=normalizeInput.js.map