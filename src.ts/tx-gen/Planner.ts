import { ContractInterface } from '@ethersproject/contracts'
import type { Contract as EthersContract } from '@ethersproject/contracts'
import { Interface, ParamType, defaultAbiCoder } from '@ethersproject/abi'
import type { FunctionFragment } from '@ethersproject/abi'
import { defineReadOnly, getStatic } from '@ethersproject/properties'
import { hexConcat, hexDataSlice } from '@ethersproject/bytes'
import { DefaultMap } from '../base/DefaultMap'
import { Address } from '../base/Address'
import type { Universe } from '../Universe'

const variableNames = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
]
let valueId = 0
const valueNames = new DefaultMap<Value, string>(() => {
  const thisId = valueId++
  const name = variableNames[thisId % variableNames.length]
  return name
})

/**
 * Represents a value that can be passed to a function call.
 *
 * This can represent a literal value, a return value from a previous function call,
 * or one of several internal placeholder value types.
 */
export interface Value {
  /** The ethers.js `ParamType` describing the type of this value. */
  param: ParamType
}

function isValue(arg: any): arg is Value {
  return (arg as Value).param !== undefined
}

export class LiteralValue implements Value {
  readonly param: ParamType
  readonly value: string

  constructor(param: ParamType, value: string) {
    this.param = param
    this.value = value
  }
}

export class TupleLiteral implements Value {
  constructor(
    public readonly param: ParamType,
    public readonly values: Value[]
  ) {}
}

export class ReturnValue implements Value {
  readonly param: ParamType
  readonly command: Command // Function call we want the return value of
  readonly name: string

  constructor(param: ParamType, command: Command, name?: string) {
    this.param = param
    this.command = command
    this.name = name ?? valueNames.get(this)
  }
}

export class StateValue implements Value {
  readonly param: ParamType

  constructor() {
    this.param = ParamType.from('bytes[]')
  }
}

export class SubplanValue implements Value {
  readonly param: ParamType
  readonly planner: Planner

  constructor(planner: Planner) {
    this.param = ParamType.from('bytes[]')
    this.planner = planner
  }
}

/**
 * CommandFlags
 * @description Flags that modify a command's execution
 * @enum {number}
 */
export enum CommandFlags {
  /** Specifies that a call should be made using the DELEGATECALL opcode */
  DELEGATECALL = 0x00,
  /** Specifies that a call should be made using the CALL opcode */
  CALL = 0x01,
  /** Specifies that a call should be made using the STATICCALL opcode */
  STATICCALL = 0x02,
  /** Specifies that a call should be made using the CALL opcode, and that the first argument will be the value to send */
  CALL_WITH_VALUE = 0x03,
  /** A bitmask that selects calltype flags */
  CALLTYPE_MASK = 0x03,
  /** Specifies that this is an extended command, with an additional command word for indices. Internal use only. */
  EXTENDED_COMMAND = 0x80,
  /** Specifies that the return value of this call should be wrapped in a `bytes`. Internal use only. */
  TUPLE_RETURN = 0x80,
}

/**
 * Represents a call to a contract function as part of a Weiroll plan.
 *
 * A `FunctionCall` is created by calling functions on a [[Contract]] object, and consumed by
 * passing it to [[Planner.add]], [[Planner.addSubplan]] or [[Planner.replaceState]]
 */
export class FunctionCall {
  /** The Contract this function is on. */
  readonly contract: Contract
  /** Flags modifying the execution of this function call. */
  readonly flags: CommandFlags
  /** An ethers.js Fragment that describes the function being called. */
  readonly fragment: FunctionFragment

  /** If the call type is a call-with-value, this property holds the value that will be passed. */
  readonly callvalue?: Value
  readonly args: Value[]

  /** @hidden */
  constructor(
    contract: Contract,
    flags: CommandFlags,
    fragment: FunctionFragment,
    public readonly inArgs: Value[],
    callvalue?: Value
  ) {
    this.contract = contract
    this.flags = flags
    this.fragment = fragment
    this.callvalue = callvalue

    this.args = []
    const emitArg = (arg: Value) => {
      if (arg instanceof TupleLiteral) {
        for (const value of arg.values) {
          emitArg(value)
        }
      } else {
        this.args.push(arg)
      }
    }
    inArgs.forEach(emitArg)
  }

  /**
   * Returns a new [[FunctionCall]] that sends value with the call.
   * @param value The value (in wei) to send with the call
   */
  withValue(value: Value): FunctionCall {
    if (
      (this.flags & CommandFlags.CALLTYPE_MASK) !== CommandFlags.CALL &&
      (this.flags & CommandFlags.CALLTYPE_MASK) !== CommandFlags.CALL_WITH_VALUE
    ) {
      throw new Error('Only CALL operations can send value')
    }
    return new FunctionCall(
      this.contract,
      (this.flags & ~CommandFlags.CALLTYPE_MASK) | CommandFlags.CALL_WITH_VALUE,
      this.fragment,
      this.args,
      encodeArg(value, ParamType.from('uint'))
    )
  }

  /**
   * Returns a new [[FunctionCall]] whose return value will be wrapped as a `bytes`.
   * This permits capturing the return values of functions with multiple return parameters,
   * which weiroll does not otherwise support.
   */
  rawValue(): FunctionCall {
    return new FunctionCall(
      this.contract,
      this.flags | CommandFlags.TUPLE_RETURN,
      this.fragment,
      this.args,
      this.callvalue
    )
  }

  /**
   * Returns a new [[FunctionCall]] that executes a STATICCALL instead of a regular CALL.
   */
  staticcall(): FunctionCall {
    if ((this.flags & CommandFlags.CALLTYPE_MASK) !== CommandFlags.CALL) {
      throw new Error('Only CALL operations can be made static')
    }
    return new FunctionCall(
      this.contract,
      (this.flags & ~CommandFlags.CALLTYPE_MASK) | CommandFlags.STATICCALL,
      this.fragment,
      this.args,
      this.callvalue
    )
  }
}

/**
 * The type of all contract-specific functions on the [[Contract]] object.
 */
export type ContractFunction = (...args: Array<any>) => FunctionCall

export function isDynamicType(param?: ParamType): boolean {
  if (typeof param === 'undefined') return false
  if (param.baseType === 'array') {
    // Fixed length arrays are only dynamic if the child type is dynamic
    if (param.arrayLength !== -1) {
      return isDynamicType(param.arrayChildren)
    }
    return true
  }
  if (param.baseType === 'tuple') {
    // Only if any component of the tuple is dynamic the tuple is dynamic
    return param.components.some((i) => isDynamicType(i))
  }
  return ['string', 'bytes'].includes(param.baseType)
}

function abiEncodeSingle(
  param: ParamType,
  value: any
): LiteralValue | TupleLiteral {
  const isDyn = isDynamicType(param)
  if (isDyn) {
    const encoded = hexDataSlice(defaultAbiCoder.encode([param], [value]), 32)
    return new LiteralValue(param, encoded)
  }
  if (param.type === 'tuple') {
    const components = Object.values(value).map((v, i) =>
      encodeArg(v, param.components[i])
    )
    return new TupleLiteral(param, components)
  }
  if (param.baseType === 'array') {
    const components = Object.values(value).map((v) =>
      encodeArg(v, param.arrayChildren)
    )
    return new TupleLiteral(param, components)
  }

  return new LiteralValue(param, defaultAbiCoder.encode([param], [value]))
}

export function encodeArg(arg: unknown, param: ParamType): Value {
  if (isValue(arg)) {
    if (arg.param.type !== param.type) {
      if (
        param.type === 'bytes' &&
        (arg.param.baseType === 'array' || arg.param.baseType === 'tuple')
      ) {
        return arg
      }
      if (
        arg.param.type === 'bytes' &&
        (param.baseType === 'array' || param.baseType === 'tuple')
      ) {
        return arg
      }
      if (param.type === 'bytes' && arg instanceof LiteralValue) {
        return abiEncodeSingle(param, arg.value)
      }
      if (arg.param.type.includes('int') && param.type.includes('int')) {
        return arg
      }
      if (arg.param.type.startsWith('bytes32') && !isDynamicType(param)) {
        return arg
      }
      if (param.type.startsWith('bytes32') && !isDynamicType(arg.param)) {
        return arg
      }
      if (arg.param.type.includes('int') && param.type === 'bool') {
        return arg
      }
      // Todo: type casting rules
      throw new Error(
        `Cannot pass value of type ${arg.param.type} to input of type ${param.type}`
      )
    }
    return arg
  } else if (arg instanceof Planner) {
    return new SubplanValue(arg)
  } else {
    return abiEncodeSingle(param, arg === '0x' ? '0x0' : arg)
  }
}

function buildCall(
  contract: Contract,
  fragment: FunctionFragment
): ContractFunction {
  return function call(...args: Array<any>): FunctionCall {
    if (args.length !== fragment.inputs.length) {
      throw new Error(
        `Function ${fragment.name} has ${fragment.inputs.length} arguments but ${args.length} provided`
      )
    }

    const encodedArgs = args.map((arg, idx) =>
      encodeArg(arg, fragment.inputs[idx])
    )

    return new FunctionCall(
      contract,
      contract.commandflags,
      fragment,
      encodedArgs
    )
  }
}

class BaseContract {
  /** The address of the contract */
  readonly address: string
  /** Flags specifying the default execution options for all functions */
  readonly commandflags: CommandFlags
  /** The ethers.js Interface representing the contract */
  readonly interface: Interface
  /** A mapping from function names to [[ContractFunction]]s. */
  readonly functions: { [name: string]: ContractFunction }

  /**
   * @param address The address of the contract
   * @param contractInterface The ethers.js Interface representing the contract
   * @param commandflags Optional flags specifying the default execution options for all functions
   */
  constructor(
    address: string,
    contractInterface: ContractInterface,
    commandflags: CommandFlags = 0
  ) {
    this.interface = getStatic<
      (contractInterface: ContractInterface) => Interface
    >(
      new.target,
      'getInterface'
    )(contractInterface)
    if ((commandflags & ~CommandFlags.CALLTYPE_MASK) !== 0) {
      throw new Error(
        'Only calltype flags may be supplied to BaseContract constructor'
      )
    }

    this.address = address
    this.commandflags = commandflags
    this.functions = {}

    const uniqueNames: { [name: string]: Array<string> } = {}
    const uniqueSignatures: { [signature: string]: boolean } = {}
    Object.keys(this.interface.functions).forEach((signature) => {
      const fragment = this.interface.functions[signature]

      // Check that the signature is unique; if not the ABI generation has
      // not been cleaned or may be incorrectly generated
      if (uniqueSignatures[signature]) {
        throw new Error(`Duplicate ABI entry for ${JSON.stringify(signature)}`)
      }
      uniqueSignatures[signature] = true

      // Track unique names; we only expose bare named functions if they
      // are ambiguous
      {
        const name = fragment.name
        if (!uniqueNames[name]) {
          uniqueNames[name] = []
        }
        uniqueNames[name].push(signature)
      }

      if ((this as Contract)[signature] == null) {
        defineReadOnly<any, any>(this, signature, buildCall(this, fragment))
      }

      // We do not collapse simple calls on this bucket, which allows
      // frameworks to safely use this without introspection as well as
      // allows decoding error recovery.
      if (this.functions[signature] == null) {
        defineReadOnly(this.functions, signature, buildCall(this, fragment))
      }
    })

    Object.keys(uniqueNames).forEach((name) => {
      // Ambiguous names to not get attached as bare names
      const signatures = uniqueNames[name]
      if (signatures.length > 1) {
        return
      }

      const signature = signatures[0]

      // If overwriting a member property that is null, swallow the error
      try {
        if ((this as Contract)[name] == null) {
          defineReadOnly(this as Contract, name, (this as Contract)[signature])
        }
      } catch (e) {}

      if (this.functions[name] == null) {
        defineReadOnly(this.functions, name, this.functions[signature])
      }
    })
  }

  /**
   * Creates a [[Contract]] object from an ethers.js contract.
   * All calls on the returned object will default to being standard CALL operations.
   * Use this when you want your weiroll script to call a standard external contract.
   * @param contract The ethers.js Contract object to wrap.
   * @param commandflags Optionally specifies a non-default call type to use, such as
   *        [[CommandFlags.STATICCALL]].
   */
  static createContract(
    contract: EthersContract,
    commandflags = CommandFlags.CALL
  ): Contract {
    return new Contract(contract.address, contract.interface, commandflags)
  }

  /**
   * Creates a [[Contract]] object from an ethers.js contract.
   * All calls on the returned object will default to being DELEGATECALL operations.
   * Use this when you want your weiroll script to call a library specifically designed
   * for use with weiroll.
   * @param contract The ethers.js Contract object to wrap.
   */
  static createLibrary(contract: EthersContract): Contract {
    return new Contract(
      contract.address,
      contract.interface,
      CommandFlags.DELEGATECALL
    )
  }

  /** @hidden */
  static getInterface(contractInterface: ContractInterface): Interface {
    if (Interface.isInterface(contractInterface)) {
      return contractInterface
    }
    return new Interface(contractInterface)
  }
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
export class Contract extends BaseContract {
  // The meta-class properties
  readonly [key: string]: ContractFunction | any
}

export enum CommandType {
  CALL,
  RAWCALL,
  SUBPLAN,
}
class Command {
  readonly call: FunctionCall
  readonly type: CommandType

  constructor(call: FunctionCall, type: CommandType) {
    this.call = call
    this.type = type
  }
}

interface PlannerState {
  // Maps from a command to the slot used for its return value
  returnSlotMap: Map<Command, number>
  // Maps from a literal to the slot used to store it
  literalSlotMap: Map<string, number>
  // An array of unused state slots
  freeSlots: Array<number>
  // Maps from a command to the slots that expire when it's executed
  stateExpirations: Map<Command, number[]>
  // Maps from a command to the last command that consumes its output
  commandVisibility: Map<Command, Command>
  // The initial state array
  state: Array<string>
}

function padArray(a: Array<number>, len: number, value: number): Array<number> {
  return a.concat(new Array<number>(len - a.length).fill(value))
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
export class Planner {
  /**
   * Represents the current state of the planner.
   * This value can be passed as an argument to a function that accepts a `bytes[]`. At runtime it will
   * be replaced with the current state of the weiroll planner.
   */
  readonly state: StateValue

  /** @hidden */
  commands: Command[]
  comments: (string | undefined)[] = []
  returnVals = new Map<Command, ReturnValue>()

  headerComments: string[] = []
  globalComments = new Map<Command, string[]>()

  addComment(comment: string) {
    if (this.commands.length === 0) {
      this.headerComments.push(comment)
      return
    }
    const comments =
      this.globalComments.get(this.commands[this.commands.length - 1]) ?? []
    comments.push(comment)
    this.globalComments.set(this.commands[this.commands.length - 1], comments)
  }

  constructor() {
    this.state = new StateValue()
    this.commands = []
  }

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
  add(
    call: FunctionCall,
    comment?: string,
    variableName?: string
  ): ReturnValue | null {
    const command = new Command(call, CommandType.CALL)

    this.commands.push(command)
    this.comments.push(comment)

    for (const arg of call.args) {
      if (arg instanceof SubplanValue) {
        throw new Error('Only subplans can have arguments of type SubplanValue')
      }
    }

    if (call.flags & CommandFlags.TUPLE_RETURN) {
      const ret = new ReturnValue(
        ParamType.fromString('bytes'),
        command,
        variableName
      )
      this.returnVals.set(command, ret)
      return ret
    }
    if (call.fragment.outputs?.length !== 1) {
      return null
    }
    const ret = new ReturnValue(call.fragment.outputs[0], command, variableName)
    this.returnVals.set(command, ret)
    return ret
  }

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
  addSubplan(call: FunctionCall) {
    let hasSubplan = false
    let hasState = false
    for (const arg of call.args) {
      if (arg instanceof SubplanValue) {
        if (hasSubplan) {
          throw new Error('Subplans can only take one planner argument')
        }
        hasSubplan = true
      }
      if (arg instanceof StateValue) {
        if (hasState) {
          throw new Error('Subplans can only take one state argument')
        }
        hasState = true
      }
    }
    if (!hasSubplan || !hasState) {
      throw new Error('Subplans must take planner and state arguments')
    }
    if (!hasSubplan || !hasState) {
      throw new Error('Subplans must take planner and state arguments')
    }

    if (
      call.fragment.outputs?.length === 1 &&
      call.fragment.outputs[0].type !== 'bytes[]'
    ) {
      throw new Error(
        'Subplans must return a bytes[] replacement state or nothing'
      )
    }

    this.commands.push(new Command(call, CommandType.SUBPLAN))
  }

  /**
   * Executes a [[FunctionCall]], and replaces the planner state with the value it
   * returns. This can be used to execute functions that make arbitrary changes to
   * the planner state. Note that the planner library is not aware of these changes -
   * so it may produce invalid plans if you don't know what you're doing.
   * @param call The [[FunctionCall]] to execute
   */
  replaceState(call: FunctionCall) {
    if (
      call.fragment.outputs?.length !== 1 ||
      call.fragment.outputs[0].type !== 'bytes[]'
    ) {
      throw new Error('Function replacing state must return a bytes[]')
    }

    this.commands.push(new Command(call, CommandType.RAWCALL))
  }

  private preplan(
    commandVisibility: Map<Command, Command>,
    literalVisibility: Map<string, Command>,
    seen?: Set<Command>,
    planners?: Set<Planner>
  ) {
    if (seen === undefined) {
      seen = new Set<Command>()
    }
    if (planners === undefined) {
      planners = new Set<Planner>()
    }

    if (planners.has(this)) {
      throw new Error('A planner cannot contain itself')
    }
    planners.add(this)

    // Build visibility maps
    for (let command of this.commands) {
      let inargs = command.call.args
      if (
        (command.call.flags & CommandFlags.CALLTYPE_MASK) ===
        CommandFlags.CALL_WITH_VALUE
      ) {
        if (!command.call.callvalue) {
          throw new Error('Call with value must have a value parameter')
        }
        inargs = [command.call.callvalue].concat(inargs)
      }

      for (let arg of inargs) {
        if (arg instanceof ReturnValue) {
          if (!seen.has(arg.command)) {
            throw new Error(
              `Return value from "${arg.command.call.fragment.name}" is not visible here`
            )
          }
          commandVisibility.set(arg.command, command)
        } else if (arg instanceof LiteralValue) {
          literalVisibility.set(arg.value, command)
        } else if (arg instanceof SubplanValue) {
          let subplanSeen = seen
          if (
            !command.call.fragment.outputs ||
            command.call.fragment.outputs.length === 0
          ) {
            // Read-only subplan; return values aren't visible externally
            subplanSeen = new Set<Command>(seen)
          }
          arg.planner.preplan(
            commandVisibility,
            literalVisibility,
            subplanSeen,
            planners
          )
        } else if (!(arg instanceof StateValue)) {
          throw new Error(`Unknown function argument type '${typeof arg}'`)
        }
      }
      seen.add(command)
    }

    return { commandVisibility, literalVisibility }
  }

  private buildCommandArgs(
    command: Command,
    returnSlotMap: Map<Command, number>,
    literalSlotMap: Map<string, number>,
    state: Array<string>
  ): Array<number> {
    // Build a list of argument value indexes
    let inargs = command.call.args
    if (
      (command.call.flags & CommandFlags.CALLTYPE_MASK) ===
      CommandFlags.CALL_WITH_VALUE
    ) {
      if (!command.call.callvalue) {
        throw new Error('Call with value must have a value parameter')
      }
      inargs = [command.call.callvalue].concat(inargs)
    }

    const args = new Array<number>()
    inargs.forEach((arg) => {
      let slot: number
      if (arg instanceof ReturnValue) {
        slot = returnSlotMap.get(arg.command) as number
      } else if (arg instanceof LiteralValue) {
        slot = literalSlotMap.get(arg.value) as number
      } else if (arg instanceof StateValue) {
        slot = 0xfe
      } else if (arg instanceof SubplanValue) {
        // buildCommands has already built the subplan and put it in the last state slot
        slot = state.length - 1
      } else {
        throw new Error(`Unknown function argument type '${typeof arg}'`)
      }
      if (isDynamicType(arg.param)) {
        slot |= 0x80
      }
      args.push(slot)
    })

    return args
  }

  private buildCommands(ps: PlannerState): Array<string> {
    const encodedCommands = new Array<string>()
    // Build commands, and add state entries as needed
    for (let command of this.commands) {
      if (command.type === CommandType.SUBPLAN) {
        // Find the subplan
        const subplanner = (
          command.call.args.find(
            (arg) => arg instanceof SubplanValue
          ) as SubplanValue
        ).planner
        // Build a list of commands
        const subcommands = subplanner.buildCommands(ps)
        // Encode them and push them to a new state slot
        ps.state.push(
          hexDataSlice(defaultAbiCoder.encode(['bytes32[]'], [subcommands]), 32)
        )
        // The slot is no longer needed after this command
        ps.freeSlots.push(ps.state.length - 1)
      }

      let flags = command.call.flags

      const args = this.buildCommandArgs(
        command,
        ps.returnSlotMap,
        ps.literalSlotMap,
        ps.state
      )

      if (args.length > 6) {
        flags |= CommandFlags.EXTENDED_COMMAND
      }

      // Add any newly unused state slots to the list
      ps.freeSlots = ps.freeSlots.concat(ps.stateExpirations.get(command) || [])

      // Figure out where to put the return value
      let ret = 0xff
      if (ps.commandVisibility.has(command)) {
        if (
          command.type === CommandType.RAWCALL ||
          command.type === CommandType.SUBPLAN
        ) {
          throw new Error(
            `Return value of ${command.call.fragment.name} cannot be used to replace state and in another function`
          )
        }
        ret = ps.state.length

        if (ps.freeSlots.length > 0) {
          ret = ps.freeSlots.pop() as number
        }

        // Store the slot mapping
        ps.returnSlotMap.set(command, ret)

        // Make the slot available when it's not needed
        const expiryCommand = ps.commandVisibility.get(command) as Command
        ps.stateExpirations.set(
          expiryCommand,
          (ps.stateExpirations.get(expiryCommand) || []).concat([ret])
        )

        if (ret === ps.state.length) {
          ps.state.push('0x')
        }

        if (isDynamicType(command.call.fragment.outputs?.[0])) {
          ret |= 0x80
        }
      } else if (
        command.type === CommandType.RAWCALL ||
        command.type === CommandType.SUBPLAN
      ) {
        if (
          command.call.fragment.outputs &&
          command.call.fragment.outputs.length === 1
        ) {
          ret = 0xfe
        }
      }

      if (
        (flags & CommandFlags.EXTENDED_COMMAND) ===
        CommandFlags.EXTENDED_COMMAND
      ) {
        // Extended command
        encodedCommands.push(
          hexConcat([
            command.call.contract.interface.getSighash(command.call.fragment),
            [flags, 0, 0, 0, 0, 0, 0, ret],
            command.call.contract.address,
          ])
        )
        encodedCommands.push(hexConcat([padArray(args, 32, 0xff)]))
      } else {
        // Standard command
        encodedCommands.push(
          hexConcat([
            command.call.contract.interface.getSighash(command.call.fragment),
            [flags],
            padArray(args, 6, 0xff),
            [ret],
            command.call.contract.address,
          ])
        )
      }
    }
    return encodedCommands
  }

  /**
   * Builds an execution plan for all the commands added to the planner.
   * @returns `commands` and `state`, which can be passed directly to the weiroll executor
   *          to execute the plan.
   */
  plan(): { commands: string[]; state: string[] } {
    // Tracks the last time a literal is used in the program
    const literalVisibility = new Map<string, Command>()
    // Tracks the last time a command's output is used in the program
    const commandVisibility = new Map<Command, Command>()

    this.preplan(commandVisibility, literalVisibility)

    // Maps from commands to the slots that expire on execution (if any)
    const stateExpirations = new Map<Command, number[]>()

    // Tracks the state slot each literal is stored in
    const literalSlotMap = new Map<string, number>()

    const state = new Array<string>()

    // Prepopulate the state and state expirations with literals
    literalVisibility.forEach((lastCommand, literal) => {
      if (literalSlotMap.has(literal)) {
        const slot = literalSlotMap.get(literal) as number
        stateExpirations.set(
          lastCommand,
          (stateExpirations.get(lastCommand) || []).concat([slot])
        )
        return
      }
      const slot = state.length
      state.push(literal)
      literalSlotMap.set(literal, slot)
      stateExpirations.set(
        lastCommand,
        (stateExpirations.get(lastCommand) || []).concat([slot])
      )
    })

    const ps: PlannerState = {
      returnSlotMap: new Map<Command, number>(),
      literalSlotMap,
      freeSlots: new Array<number>(),
      stateExpirations,
      commandVisibility,
      state,
    }

    let encodedCommands = this.buildCommands(ps)

    if (state.length > 128) {
      throw new Error('State is too long')
    }

    return { commands: encodedCommands, state }
  }
}

const formatBytes = (bytes: string): string => {
  if (bytes.length < 64) {
    return bytes
  }
  return `[len=${bytes.length}]0x${bytes.slice(66, 66 + 32)}...${bytes.slice(
    -32
  )}`
}
const formatAddress = (address: string, universe: Universe): string => {
  const addr =
    address.length === 66
      ? Address.from('0x' + address.slice(26, 66))
      : Address.from(address)

  if (universe.tokens.has(addr)) {
    return universe.tokens.get(addr)!.symbol
  }
  if (universe.execAddress === addr) {
    return 'this'
  }
  const addrObj = Address.from(
    address.length === 66 ? '0x' + address.slice(26, 66) : address
  )
  const aliases = Object.entries(universe.config.addresses)
  const alias = aliases.find((e) => e[1] === addrObj)

  if (alias) {
    if (alias[0].endsWith('Address')) {
      return alias[0].slice(0, -7)
    }
    return alias[0]
  }
  if (addr === Address.ZERO) {
    return `address(0)`
  }
  return addr.toString()
}
const formatValue = (value: Value, universe: Universe): string => {
  if (value instanceof TupleLiteral) {
    return `(${value.values.map((i) => formatValue(i, universe)).join(', ')})`
  } else if (value instanceof ReturnValue) {
    return value.name
  } else if (value instanceof LiteralValue) {
    if (value.param.type === 'string') {
      let chars = value.value.slice(66)
      for (let i = 0; i < chars.length; i += 2) {
        if (chars[i] === '0' && chars[i + 1] === '0') {
          chars = chars.slice(0, i)
          break
        }
      }
      return (
        '(string,len=' +
        chars.length / 2 +
        ')"' +
        Buffer.from(chars, 'hex').toString('utf8') +
        '"'
      )
    }
    if (value.param.baseType === 'array') {
      return `(${value.param.type})`
    }
    if (value.param.type === 'bytes') {
      return `${formatBytes(value.value)}`
    }
    if (value.param.type === 'address') {
      if (value.value === '0x') {
        return `[${0x0}]`
      }
      return `${formatAddress(value.value, universe)}`
    }
    if (value.param.type === 'tuple') {
      return `(${value.param.components.map((i) => i.type)})` //(${decoded.map(formatDecoded).join(", ")})`
    }
    const out = defaultAbiCoder.decode([value.param], value.value)
    if (
      value.param.type === 'uint256' &&
      out[0] ===
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    ) {
      return 'type(uint256).max'
    }
    return `${out.length <= 1 ? out[0] : `[ ${out.join(', ')} ]`}`
  } else if (value instanceof StateValue) {
    return `(state)(${value.param.type})`
  }
  return ''
}
export const printPlan = (plan: Planner, universe: Universe): string[] => {
  const out: string[] = []

  for (const comment of plan.headerComments) {
    out.push(`// ${comment}`)
  }

  for (let i = 0; i < plan.commands.length; i++) {
    const step = plan.commands[i]

    let callFlags = ''
    if (
      (step.call.flags & CommandFlags.CALLTYPE_MASK) ===
      CommandFlags.DELEGATECALL
    ) {
      callFlags = ':delegate'
    }
    if (
      (step.call.flags & CommandFlags.CALLTYPE_MASK) ===
      CommandFlags.STATICCALL
    ) {
      callFlags = ':static'
    }
    const comment = plan.comments[i]

    let prefix = `cmd ${i}:`
    if (comment != null) {
      out.push(`// ${comment}`)
    }

    const addr = formatAddress(step.call.contract.address, universe)
    const methodName = step.call.fragment.name
    let formattedArgs: string[] = []

    for (let i = 0; i < step.call.inArgs.length; i++) {
      const value = step.call.inArgs[i]
      const paramName = step.call.fragment.inputs[i]?.name ?? `arg_${i}`
      // const paramType = step.call.fragment.inputs[i].type
      formattedArgs.push(paramName + ' = ' + formatValue(value, universe))
    }

    let valueParms = ''
    if (step.call.callvalue != null) {
      valueParms = `{value: ${formatValue(step.call.callvalue, universe)}}`
    }

    let argsArray = formattedArgs.join(', ')
    if (argsArray.length > 100) {
      argsArray = '\n' + '   ' + formattedArgs.join(',\n   ') + '\n'
    }

    const formatted = `${addr}${callFlags}.${methodName}${valueParms}(${argsArray})`

    const retVal = plan.returnVals.get(step)
    const finalStr =
      retVal == null
        ? `${prefix} ${formatted} # sighash: ${step.call.contract.interface.getSighash(
            step.call.fragment
          )}`
        : `${prefix} ${retVal.name}: ${
            retVal.param.type
          } = ${formatted} # sighash: ${step.call.contract.interface.getSighash(
            step.call.fragment
          )}`
    out.push(...finalStr.split('\n'))

    out.push('')

    const postCommandComments = plan.globalComments.get(step) ?? []
    for (const comment of postCommandComments) {
      out.push(`// ${comment}`)
    }
  }

  return out
}
