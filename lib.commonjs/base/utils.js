"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseHexStringIntoBuffer = void 0;
const buffer_1 = require("buffer");
const parseHexStringIntoBuffer = (maybeHex) => {
    if (maybeHex.length % 2 !== 0) {
        throw new Error('Invalid encoding: ' + maybeHex);
    }
    if (maybeHex === '' || maybeHex === '0x') {
        return buffer_1.Buffer.alloc(0);
    }
    let out;
    maybeHex = maybeHex.toLowerCase();
    if (maybeHex.startsWith('0x')) {
        if (!/^0x([0-9a-f][0-9a-f])+$/.test(maybeHex)) {
            throw new Error('Invalid hex encoding');
        }
        out = buffer_1.Buffer.from(maybeHex.slice(2), 'hex');
    }
    else {
        if (!/^([0-9a-f][0-9a-f])+$/.test(maybeHex)) {
            throw new Error('Invalid hex encoding');
        }
        out = buffer_1.Buffer.from(maybeHex, 'hex');
    }
    if (out.length === 0) {
        throw new Error('Invalid encoding: ' + maybeHex);
    }
    return out;
};
exports.parseHexStringIntoBuffer = parseHexStringIntoBuffer;
//# sourceMappingURL=utils.js.map