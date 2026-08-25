let _solana_kit = require("@solana/kit");
//#region src/base64Utils.ts
function encode(input) {
	return (0, _solana_kit.getBase64Decoder)().decode((0, _solana_kit.getUtf8Encoder)().encode(input));
}
function fromUint8Array$1(byteArray, urlsafe) {
	const base64 = (0, _solana_kit.getBase64Decoder)().decode(byteArray);
	if (urlsafe) return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
	else return base64;
}
function toUint8Array$1(base64EncodedByteArray) {
	return (0, _solana_kit.getBase64Encoder)().encode(base64EncodedByteArray);
}
//#endregion
//#region src/base58Utils.ts
function fromUint8Array(byteArray) {
	return (0, _solana_kit.getBase58Decoder)().decode(byteArray);
}
function toUint8Array(base58EncodedByteArray) {
	return (0, _solana_kit.getBase58Encoder)().encode(base58EncodedByteArray);
}
function base64ToBase58(base64EncodedString) {
	return fromUint8Array(toUint8Array$1(base64EncodedString));
}
//#endregion
Object.defineProperty(exports, "base64ToBase58", {
	enumerable: true,
	get: function() {
		return base64ToBase58;
	}
});
Object.defineProperty(exports, "encode", {
	enumerable: true,
	get: function() {
		return encode;
	}
});
Object.defineProperty(exports, "fromUint8Array", {
	enumerable: true,
	get: function() {
		return fromUint8Array;
	}
});
Object.defineProperty(exports, "fromUint8Array$1", {
	enumerable: true,
	get: function() {
		return fromUint8Array$1;
	}
});
Object.defineProperty(exports, "toUint8Array", {
	enumerable: true,
	get: function() {
		return toUint8Array;
	}
});
Object.defineProperty(exports, "toUint8Array$1", {
	enumerable: true,
	get: function() {
		return toUint8Array$1;
	}
});

//# sourceMappingURL=base58Utils.js.map