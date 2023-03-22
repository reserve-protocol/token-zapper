import { Buffer } from 'buffer';
export const parseHexStringIntoBuffer = (maybeHex) => {
    if (maybeHex.length % 2 !== 0) {
        throw new Error('Invalid encoding: ' + maybeHex);
    }
    if (maybeHex === '' || maybeHex === '0x') {
        return Buffer.alloc(0);
    }
    let out;
    maybeHex = maybeHex.toLowerCase();
    if (maybeHex.startsWith('0x')) {
        if (!/^0x([0-9a-f][0-9a-f])+$/.test(maybeHex)) {
            throw new Error('Invalid hex encoding');
        }
        out = Buffer.from(maybeHex.slice(2), 'hex');
    }
    else {
        if (!/^([0-9a-f][0-9a-f])+$/.test(maybeHex)) {
            throw new Error('Invalid hex encoding');
        }
        out = Buffer.from(maybeHex, 'hex');
    }
    if (out.length === 0) {
        throw new Error('Invalid encoding: ' + maybeHex);
    }
    return out;
};
//# sourceMappingURL=utils.js.map