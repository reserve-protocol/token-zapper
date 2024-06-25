import { type Universe } from '../Universe';
import { type ConfigWithToken } from './ChainConfiguration';
export declare const setupWrappedGasToken: <const WrappedTokenName extends string>(universe: Universe<ConfigWithToken<{ [K in WrappedTokenName]: string; }>>, wrappedTokenName?: WrappedTokenName) => Promise<void>;
//# sourceMappingURL=setupWrappedGasToken.d.ts.map