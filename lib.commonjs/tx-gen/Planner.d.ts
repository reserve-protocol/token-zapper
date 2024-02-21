import { ContractInterface } from '@ethersproject/contracts';
import type { Contract as EthersContract } from '@ethersproject/contracts';
import { Interface, ParamType } from '@ethersproject/abi';
import type { FunctionFragment } from '@ethersproject/abi';
import type { Universe } from '../Universe';
/**
 * Represents a value that can be passed to a function call.
 *
 * This can represent a literal value, a return value from a previous function call,
 * or one of several internal placeholder value types.
 */
export interface Value {
    /** The ethers.js `ParamType` describing the type of this value. */
    param: ParamType;
}
export declare class LiteralValue implements Value {
    readonly param: ParamType;
    readonly value: string;
    constructor(param: ParamType, value: string);
}
export declare class ReturnValue implements Value {
    readonly param: ParamType;
    readonly command: Command;
    readonly name: string;
    constructor(param: ParamType, command: Command, name?: string);
}
export declare class StateValue implements Value {
    readonly param: ParamType;
    constructor();
}
export declare class SubplanValue implements Value {
    readonly param: ParamType;
    readonly planner: Planner;
    constructor(planner: Planner);
}
/**
 * CommandFlags
 * @description Flags that modify a command's execution
 * @enum {number}
 */
export declare enum CommandFlags {
    /** Specifies that a call should be made using the DELEGATECALL opcode */
    DELEGATECALL = 0,
    /** Specifies that a call should be made using the CALL opcode */
    CALL = 1,
    /** Specifies that a call should be made using the STATICCALL opcode */
    STATICCALL = 2,
    /** Specifies that a call should be made using the CALL opcode, and that the first argument will be the value to send */
    CALL_WITH_VALUE = 3,
    /** A bitmask that selects calltype flags */
    CALLTYPE_MASK = 3,
    /** Specifies that this is an extended command, with an additional command word for indices. Internal use only. */
    EXTENDED_COMMAND = 128,
    /** Specifies that the return value of this call should be wrapped in a `bytes`. Internal use only. */
    TUPLE_RETURN = 128
}
/**
 * Represents a call to a contract function as part of a Weiroll plan.
 *
 * A `FunctionCall` is created by calling functions on a [[Contract]] object, and consumed by
 * passing it to [[Planner.add]], [[Planner.addSubplan]] or [[Planner.replaceState]]
 */
export declare class FunctionCall {
    /** The Contract this function is on. */
    readonly contract: Contract;
    /** Flags modifying the execution of this function call. */
    readonly flags: CommandFlags;
    /** An ethers.js Fragment that describes the function being called. */
    readonly fragment: FunctionFragment;
    /** An array of arguments to the function. */
    readonly args: Value[];
    /** If the call type is a call-with-value, this property holds the value that will be passed. */
    readonly callvalue?: Value;
    /** @hidden */
    constructor(contract: Contract, flags: CommandFlags, fragment: FunctionFragment, args: Value[], callvalue?: Value);
    /**
     * Returns a new [[FunctionCall]] that sends value with the call.
     * @param value The value (in wei) to send with the call
     */
    withValue(value: Value): FunctionCall;
    /**
     * Returns a new [[FunctionCall]] whose return value will be wrapped as a `bytes`.
     * This permits capturing the return values of functions with multiple return parameters,
     * which weiroll does not otherwise support.
     */
    rawValue(): FunctionCall;
    /**
     * Returns a new [[FunctionCall]] that executes a STATICCALL instead of a regular CALL.
     */
    staticcall(): FunctionCall;
}
/**
 * The type of all contract-specific functions on the [[Contract]] object.
 */
export type ContractFunction = (...args: Array<any>) => FunctionCall;
export declare function encodeArg(arg: unknown, param: ParamType): Value;
declare class BaseContract {
    /** The address of the contract */
    readonly address: string;
    /** Flags specifying the default execution options for all functions */
    readonly commandflags: CommandFlags;
    /** The ethers.js Interface representing the contract */
    readonly interface: Interface;
    /** A mapping from function names to [[ContractFunction]]s. */
    readonly functions: {
        [name: string]: ContractFunction;
    };
    /**
     * @param address The address of the contract
     * @param contractInterface The ethers.js Interface representing the contract
     * @param commandflags Optional flags specifying the default execution options for all functions
     */
    constructor(address: string, contractInterface: ContractInterface, commandflags?: CommandFlags);
    /**
     * Creates a [[Contract]] object from an ethers.js contract.
     * All calls on the returned object will default to being standard CALL operations.
     * Use this when you want your weiroll script to call a standard external contract.
     * @param contract The ethers.js Contract object to wrap.
     * @param commandflags Optionally specifies a non-default call type to use, such as
     *        [[CommandFlags.STATICCALL]].
     */
    static createContract(contract: EthersContract, commandflags?: CommandFlags): Contract;
    /**
     * Creates a [[Contract]] object from an ethers.js contract.
     * All calls on the returned object will default to being DELEGATECALL operations.
     * Use this when you want your weiroll script to call a library specifically designed
     * for use with weiroll.
     * @param contract The ethers.js Contract object to wrap.
     */
    static createLibrary(contract: EthersContract): Contract;
    /** @hidden */
    static getInterface(contractInterface: ContractInterface): Interface;
}
/**
 * Provides a dynamically created interface to interact with Ethereum contracts via weiroll.
 *
 * Once created using the constructor or the [[Contract.createContract]] or [[Contract.createLibrary]]
 * functions, the returned object is automatically populated with methods that match those on the
 * supplied contract. For instance, if your contract has a method `add(uint, uint)`, you can call it on the
 * [[Contract]] object:
 * ```typescript
 * // Assumes `Math` is an ethers.js Contract instance.
 * const math = Contract.createLibrary(Math);
 * const result = math.add(1, 2);
 * ```
 *
 * Calling a contract function returns a [[FunctionCall]] object, which you can pass to [[Planner.add]],
 * [[Planner.addSubplan]], or [[Planner.replaceState]] to add to the sequence of calls to plan.
 */
export declare class Contract extends BaseContract {
    readonly [key: string]: ContractFunction | any;
}
export declare enum CommandType {
    CALL = 0,
    RAWCALL = 1,
    SUBPLAN = 2
}
declare class Command {
    readonly call: FunctionCall;
    readonly type: CommandType;
    constructor(call: FunctionCall, type: CommandType);
}
/**
 * [[Planner]] is the main class to use to specify a sequence of operations to execute for a
 * weiroll script.
 *
 * To use a [[Planner]], construct it and call [[Planner.add]] with the function calls you wish
 * to execute. For example:
 * ```typescript
 * const events = Contract.createLibrary(Events); // Assumes `Events` is an ethers.js contract object
 * const planner = new Planner();
 * planner.add(events.logUint(123));
 * ```
 */
export declare class Planner {
    /**
     * Represents the current state of the planner.
     * This value can be passed as an argument to a function that accepts a `bytes[]`. At runtime it will
     * be replaced with the current state of the weiroll planner.
     */
    readonly state: StateValue;
    /** @hidden */
    commands: Command[];
    comments: (string | undefined)[];
    returnVals: Map<Command, ReturnValue>;
    constructor();
    /**
     * Adds a new function call to the planner. Function calls are executed in the order they are added.
     *
     * If the function call has a return value, `add` returns an object representing that value, which you
     * can pass to subsequent function calls. For example:
     * ```typescript
     * const math = Contract.createLibrary(Math); // Assumes `Math` is an ethers.js contract object
     * const events = Contract.createLibrary(Events); // Assumes `Events` is an ethers.js contract object
     * const planner = new Planner();
     * const sum = planner.add(math.add(21, 21));
     * planner.add(events.logUint(sum));
     * ```
     * @param call The [[FunctionCall]] to add to the planner
     * @returns An object representing the return value of the call, or null if it does not return a value.
     */
    add(call: FunctionCall, comment?: string, variableName?: string): ReturnValue | null;
    /**
     * Adds a call to a subplan. This has the effect of instantiating a nested instance of the weiroll
     * interpreter, and is commonly used for functionality such as flashloans, control flow, or anywhere
     * else you may need to execute logic inside a callback.
     *
     * A [[FunctionCall]] passed to [[Planner.addSubplan]] must take another [[Planner]] object as one
     * argument, and a placeholder representing the planner state, accessible as [[Planner.state]], as
     * another. Exactly one of each argument must be provided.
     *
     * At runtime, the subplan is replaced by a list of commands for the subplanner (type `bytes32[]`),
     * and `planner.state` is replaced by the current state of the parent planner instance (type `bytes[]`).
     *
     * If the `call` returns a `bytes[]`, this will be used to replace the parent planner's state after
     * the call to the subplanner completes. Return values defined inside a subplan may be used outside that
     * subplan - both in the parent planner and in subsequent subplans - only if the `call` returns the
     * updated planner state.
     *
     * Example usage:
     * ```
     * const exchange = Contract.createLibrary(Exchange); // Assumes `Exchange` is an ethers.js contract
     * const events = Contract.createLibrary(Events); // Assumes `Events` is an ethers.js contract
     * const subplanner = new Planner();
     * const outqty = subplanner.add(exchange.swap(tokenb, tokena, qty));
     *
     * const planner = new Planner();
     * planner.addSubplan(exchange.flashswap(tokena, tokenb, qty, subplanner, planner.state));
     * planner.add(events.logUint(outqty)); // Only works if `exchange.flashswap` returns updated state
     * ```
     * @param call The [[FunctionCall]] to add to the planner.
     */
    addSubplan(call: FunctionCall): void;
    /**
     * Executes a [[FunctionCall]], and replaces the planner state with the value it
     * returns. This can be used to execute functions that make arbitrary changes to
     * the planner state. Note that the planner library is not aware of these changes -
     * so it may produce invalid plans if you don't know what you're doing.
     * @param call The [[FunctionCall]] to execute
     */
    replaceState(call: FunctionCall): void;
    private preplan;
    private buildCommandArgs;
    private buildCommands;
    /**
     * Builds an execution plan for all the commands added to the planner.
     * @returns `commands` and `state`, which can be passed directly to the weiroll executor
     *          to execute the plan.
     */
    plan(): {
        commands: string[];
        state: string[];
    };
}
export declare const printPlan: (plan: Planner, universe: Universe) => string[];
export {};
