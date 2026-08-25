//#region src/arrayBufferToBase64String.d.ts
declare function arrayBufferToBase64String(buffer: ArrayBuffer): string;
//#endregion
//#region src/encoding.d.ts
declare function base58FromUint8Array(byteArray: Uint8Array): string;
declare function base58ToUint8Array(base58EncodedByteArray: string): Uint8Array;
declare function base64EncodeString(input: string): string;
declare function base64FromUint8Array(byteArray: Uint8Array): string;
declare function base64ToBase58(base64EncodedString: string): string;
declare function base64ToUint8Array(base64EncodedByteArray: string): Uint8Array;
declare function base64UrlFromUint8Array(byteArray: Uint8Array): string;
declare function utf8FromUint8Array(byteArray: Uint8Array): string;
declare function utf8ToUint8Array(input: string): Uint8Array;
//#endregion
export { arrayBufferToBase64String, base58FromUint8Array, base58ToUint8Array, base64EncodeString, base64FromUint8Array, base64ToBase58, base64ToUint8Array, base64UrlFromUint8Array, utf8FromUint8Array, utf8ToUint8Array };
//# sourceMappingURL=encoding.d.ts.map