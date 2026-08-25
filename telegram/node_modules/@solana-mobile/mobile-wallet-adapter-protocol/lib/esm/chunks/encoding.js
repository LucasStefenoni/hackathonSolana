import { getBase58Decoder, getBase58Encoder, getBase64Decoder, getBase64Encoder, getUtf8Decoder, getUtf8Encoder } from "@solana/kit";
//#region src/base64Utils.ts
function encode(input) {
	return getBase64Decoder().decode(getUtf8Encoder().encode(input));
}
function fromUint8Array$1(byteArray, urlsafe) {
	const base64 = getBase64Decoder().decode(byteArray);
	if (urlsafe) return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
	else return base64;
}
function toUint8Array$1(base64EncodedByteArray) {
	return getBase64Encoder().encode(base64EncodedByteArray);
}
//#endregion
//#region src/base58Utils.ts
function fromUint8Array(byteArray) {
	return getBase58Decoder().decode(byteArray);
}
function toUint8Array(base58EncodedByteArray) {
	return getBase58Encoder().encode(base58EncodedByteArray);
}
function base64ToBase58$1(base64EncodedString) {
	return fromUint8Array(toUint8Array$1(base64EncodedString));
}
//#endregion
//#region src/arrayBufferToBase64String.ts
function arrayBufferToBase64String(buffer) {
	return fromUint8Array$1(new Uint8Array(buffer));
}
//#endregion
//#region src/encoding.ts
function base58FromUint8Array(byteArray) {
	return fromUint8Array(byteArray);
}
function base58ToUint8Array(base58EncodedByteArray) {
	return toUint8Array(base58EncodedByteArray);
}
function base64EncodeString(input) {
	return encode(input);
}
function base64FromUint8Array(byteArray) {
	return fromUint8Array$1(byteArray);
}
function base64ToBase58(base64EncodedString) {
	return base64ToBase58$1(base64EncodedString);
}
function base64ToUint8Array(base64EncodedByteArray) {
	return toUint8Array$1(base64EncodedByteArray);
}
function base64UrlFromUint8Array(byteArray) {
	return fromUint8Array$1(byteArray, true);
}
function utf8FromUint8Array(byteArray) {
	return getUtf8Decoder().decode(byteArray);
}
function utf8ToUint8Array(input) {
	return getUtf8Encoder().encode(input);
}
//#endregion
export { base64ToBase58 as a, utf8FromUint8Array as c, base64ToBase58$1 as d, encode as f, base64FromUint8Array as i, utf8ToUint8Array as l, toUint8Array$1 as m, base58ToUint8Array as n, base64ToUint8Array as o, fromUint8Array$1 as p, base64EncodeString as r, base64UrlFromUint8Array as s, base58FromUint8Array as t, arrayBufferToBase64String as u };

//# sourceMappingURL=encoding.js.map