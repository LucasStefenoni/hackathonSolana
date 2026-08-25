Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_base58Utils = require("./chunks/base58Utils.js");
let _solana_kit = require("@solana/kit");
//#region src/arrayBufferToBase64String.ts
function arrayBufferToBase64String(buffer) {
	return require_base58Utils.fromUint8Array$1(new Uint8Array(buffer));
}
//#endregion
//#region src/encoding.ts
function base58FromUint8Array(byteArray) {
	return require_base58Utils.fromUint8Array(byteArray);
}
function base58ToUint8Array(base58EncodedByteArray) {
	return require_base58Utils.toUint8Array(base58EncodedByteArray);
}
function base64EncodeString(input) {
	return require_base58Utils.encode(input);
}
function base64FromUint8Array(byteArray) {
	return require_base58Utils.fromUint8Array$1(byteArray);
}
function base64ToBase58(base64EncodedString) {
	return require_base58Utils.base64ToBase58(base64EncodedString);
}
function base64ToUint8Array(base64EncodedByteArray) {
	return require_base58Utils.toUint8Array$1(base64EncodedByteArray);
}
function base64UrlFromUint8Array(byteArray) {
	return require_base58Utils.fromUint8Array$1(byteArray, true);
}
function utf8FromUint8Array(byteArray) {
	return (0, _solana_kit.getUtf8Decoder)().decode(byteArray);
}
function utf8ToUint8Array(input) {
	return (0, _solana_kit.getUtf8Encoder)().encode(input);
}
//#endregion
exports.arrayBufferToBase64String = arrayBufferToBase64String;
exports.base58FromUint8Array = base58FromUint8Array;
exports.base58ToUint8Array = base58ToUint8Array;
exports.base64EncodeString = base64EncodeString;
exports.base64FromUint8Array = base64FromUint8Array;
exports.base64ToBase58 = base64ToBase58;
exports.base64ToUint8Array = base64ToUint8Array;
exports.base64UrlFromUint8Array = base64UrlFromUint8Array;
exports.utf8FromUint8Array = utf8FromUint8Array;
exports.utf8ToUint8Array = utf8ToUint8Array;

//# sourceMappingURL=encoding.native.js.map