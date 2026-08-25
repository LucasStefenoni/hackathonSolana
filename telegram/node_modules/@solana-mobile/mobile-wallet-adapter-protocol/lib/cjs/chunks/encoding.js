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
	return (0, _solana_kit.getUtf8Decoder)().decode(byteArray);
}
function utf8ToUint8Array(input) {
	return (0, _solana_kit.getUtf8Encoder)().encode(input);
}
//#endregion
Object.defineProperty(exports, "arrayBufferToBase64String", {
	enumerable: true,
	get: function() {
		return arrayBufferToBase64String;
	}
});
Object.defineProperty(exports, "base58FromUint8Array", {
	enumerable: true,
	get: function() {
		return base58FromUint8Array;
	}
});
Object.defineProperty(exports, "base58ToUint8Array", {
	enumerable: true,
	get: function() {
		return base58ToUint8Array;
	}
});
Object.defineProperty(exports, "base64EncodeString", {
	enumerable: true,
	get: function() {
		return base64EncodeString;
	}
});
Object.defineProperty(exports, "base64FromUint8Array", {
	enumerable: true,
	get: function() {
		return base64FromUint8Array;
	}
});
Object.defineProperty(exports, "base64ToBase58", {
	enumerable: true,
	get: function() {
		return base64ToBase58;
	}
});
Object.defineProperty(exports, "base64ToBase58$1", {
	enumerable: true,
	get: function() {
		return base64ToBase58$1;
	}
});
Object.defineProperty(exports, "base64ToUint8Array", {
	enumerable: true,
	get: function() {
		return base64ToUint8Array;
	}
});
Object.defineProperty(exports, "base64UrlFromUint8Array", {
	enumerable: true,
	get: function() {
		return base64UrlFromUint8Array;
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
		return fromUint8Array$1;
	}
});
Object.defineProperty(exports, "toUint8Array", {
	enumerable: true,
	get: function() {
		return toUint8Array$1;
	}
});
Object.defineProperty(exports, "utf8FromUint8Array", {
	enumerable: true,
	get: function() {
		return utf8FromUint8Array;
	}
});
Object.defineProperty(exports, "utf8ToUint8Array", {
	enumerable: true,
	get: function() {
		return utf8ToUint8Array;
	}
});

//# sourceMappingURL=encoding.js.map