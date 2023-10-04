import { type Address } from './Address';
import { type Token } from '../entities/Token';
export declare class Approval {
    readonly token: Token;
    readonly spender: Address;
    constructor(token: Token, spender: Address);
    toString(): string;
}
//# sourceMappingURL=Approval.d.ts.map