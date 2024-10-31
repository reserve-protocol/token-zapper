import { Address } from "../base/Address";
import { DefaultMap } from "../base/DefaultMap";
import { Token, TokenQuantity } from "../entities/Token";
import { TokenAmounts } from "../entities/TokenAmounts";
import { Value, Planner } from "../tx-gen/Planner";
import { SwapPlan } from "./Swap";

class EvalContext {
  public readonly balances: TokenAmounts = new TokenAmounts();
}
class PlanContext extends EvalContext {
  public readonly values: Map<Token, Value> = new Map();
  public readonly planner: Planner = new Planner();
}
abstract class DagNode {
  protected consumers = new DefaultMap<Token, DagNode[]>(() => []);

  constructor(
    public readonly inputs: [number, Token][],
    public readonly outputs: [number, Token][]
  ) { }

  public forward(token: Token, next: DagNode) {
    this.consumers.get(token).push(next);
  }

  public getInputProportion(token: Token) {
    for (const [prop, tok] of this.inputs) {
      if (tok === token) {
        return prop;
      }
    }
    throw new Error(`Failed to find input proportion for ${token}`);
  }

  public async evaluate(
    context: EvalContext,
    inputs: TokenQuantity[]
  ): Promise<TokenQuantity[]> {
    throw new Error('Method not implemented.');
  }

  public async plan(
    context: PlanContext,
    inputs: Value[],
    destination: Address,
    predictedInputs: TokenQuantity[]
  ): Promise<Value | null> {
    throw new Error('Method not implemented.');
  }
}
class EffectNode extends DagNode {
  constructor(
    private readonly effect: (
      consumers: DagNode[],
      context: EvalContext,
      inputs: TokenQuantity[]
    ) => Promise<TokenQuantity[]>,
    inputToken: Token,
    outputToken: Token
  ) {
    super([[1, inputToken]], [[1, outputToken]]);
  }
  static make(
    effect: (
      consumers: DagNode[],
      context: EvalContext,
      inputs: TokenQuantity[]
    ) => Promise<TokenQuantity[]>,
    inputToken: Token,
    outputToken: Token
  ) {
    return new EffectNode(effect, inputToken, outputToken);
  }

  static balanceNode(token: Token) {
    return new EffectNode(
      async (consumers, context, inputs) => {
        if (consumers.length > 1) {
          throw new Error('BalanceNode must have exactly one consumer');
        }
        for (const input of inputs) {
          context.balances.replace(input);
        }
        if (consumers.length === 0) {
          return [context.balances.get(token)];
        }
        return await consumers[0].evaluate(context, [
          context.balances.get(token),
        ]);
      },
      token,
      token
    );
  }

  public async evaluate(
    context: EvalContext,
    inputs: TokenQuantity[]
  ): Promise<TokenQuantity[]> {
    return await this.effect(
      [...this.consumers.values()].map((i) => i[0]),
      context,
      inputs
    );
  }
}
class ActionNode extends DagNode {
  constructor(
    public readonly inputProportions: [number, Token][],
    public readonly actions: SwapPlan,
    public readonly outputProportions: [number, Token][]
  ) {
    super(
      [[1, actions.inputs[0]]],
      outputProportions
    );

    if (actions.inputs.length !== 1) {
      throw new Error('ActionNode must have exactly one input');
    }
  }

  public async evaluate(
    context: EvalContext,
    inputs: TokenQuantity[]
  ): Promise<TokenQuantity[]> {
    if (inputs.length !== 1) {
      throw new Error('ActionNode must have exactly one input');
    }
    const path = (await this.actions.quote(inputs));
    const outputs = new Map<Token, TokenQuantity>();
    await Promise.all(path.outputs.map(async (output) => {
      const consumers = this.consumers.get(output.token);
      if (consumers.length !== 1) {
        throw new Error(`Each output token must have exactly one consumer. Got ${consumers.length} for ${output.token}`);
      }
      const out = await consumers[0].evaluate(context, [output]);
      if (out.length !== 1) {
        throw new Error(`Consumer must have exactly one output. Got ${out.length} for ${output.token}`);
      }
      outputs.set(output.token, out[0]);
    }));

    const out = this.outputs.map(([_, token]) => {
      const res = outputs.get(token);
      if (res == null) {
        throw new Error(`Failed to find output for ${token}`);
      }
      return res;
    });
    return out;
  }
}
class SplitNode extends DagNode {
  constructor(
    public readonly inputToken: Token,
    public readonly splits: number[]
  ) {
    super(
      [[1, inputToken]],
      splits.map((split) => [split, inputToken])
    );
    const sum = splits.reduce((l, r) => l + r);
    const diffFromOne = Math.abs(1 - sum);
    if (diffFromOne > 0.001) {
      throw new Error('SplitNode must sum to 1');
    }
  }
  public async evaluate(
    context: EvalContext,
    inputs: TokenQuantity[]
  ): Promise<TokenQuantity[]> {
    if (inputs.length === 0) {
      throw new Error('SplitNode must have at least one input');
    }
    if (inputs.every(i => i.token !== inputs[0].token)) {
      throw new Error('SplitNode must have same token as input');
    }
    const input = inputs.reduce((l, r) => l.add(r), inputs[0].token.zero);
    const consumers = this.consumers.get(input.token);
    if (consumers.length !== this.splits.length) {
      throw new Error('SplitNode must have as many consumers as splits');
    }
    const splitQtys = this.splits.map((split) => {
      return input.mul(input.token.from(split));
    });
    const output = new TokenAmounts();

    for (const out of (
      await Promise.all(
        consumers.map((consumer, index) => consumer.evaluate(context, [splitQtys[index]])
        )
      )
    ).flat()) {
      output.add(out);
    }
    return output.toTokenQuantities();
  }
}
export class SearchContextConfig {
  constructor(
    public readonly userInput: TokenQuantity[],
    public readonly userOutput: TokenQuantity[]
  ) { }
}
export class Dag {
  private root: DagNode;
  private balanceNodeTip = new Map<Token, DagNode>();
  private balanceNodeStart = new Map<Token, DagNode>();

  private splitNodes: SplitNode[] = [];
  private openTokenSet = new Map<
    Token,
    {
      proportion: number;
      consumers: { proportion: number; consumer: DagNode; }[];
    }
  >();
  public constructor(config: SearchContextConfig) {
    this.root = new (class extends DagNode {
      constructor() {
        super(
          config.userInput.map((i) => [1, i.token]),
          config.userInput.map((i) => [1, i.token])
        );
      }
      public async evaluate(context: EvalContext, inputs: TokenQuantity[]) {
        const results = (
          await Promise.all(
            inputs.map((input) => {
              const consumers = this.consumers.get(input.token);
              if (consumers.length !== 1) {
                throw new Error('Root must have exactly one consumer');
              }
              return consumers[0].evaluate(context, [input]);
            })
          )
        ).flat();
        const output = new TokenAmounts();
        for (const out of results) {
          output.add(out);
        }
        return output.toTokenQuantities();
      }
    })();

    for (const { token } of config.userInput) {
      const inputBalanceNode = EffectNode.balanceNode(token);
      this.balanceNodeTip.set(token, inputBalanceNode);
      this.balanceNodeStart.set(token, inputBalanceNode);
      this.root.forward(token, inputBalanceNode);
    }
    for (const { token } of config.userOutput) {
      this.openTokenSet.set(token, {
        proportion: 1.0,
        consumers: [
          {
            proportion: 1.0,
            consumer: EffectNode.balanceNode(token),
          },
        ],
      });
    }
  }

  private normalizeProportions() {
    if (this.openTokenSet.size === 0) {
      return;
    }
    let sum = 0.0;
    for (const [_, { proportion }] of this.openTokenSet.entries()) {
      sum += proportion;
    }
    if (sum > 1.0) {
      throw new Error('Proportions must sum less than 1');
    }
    for (const prop of this.openTokenSet.values()) {
      if (sum === 0.0) {
        throw new Error('Sum is 0');
      }
      prop.proportion /= sum;
    }
  }

  /** Matches a balance node with an open set token,
   *  this will create splits as neccessary and connect up balance nodes to the output nodes */
  public matchBalance(token: Token) {
    const previousNode = this.balanceNodeTip.get(token);
    if (previousNode == null) {
      throw new Error('No balance for token ' + token.toString());
    }
    const prop = this.takeOpenSet(token);
    if (this.openTokenSet.size !== 0) {
      const splits = [
        ...prop.consumers.map(
          (consumer) => consumer.proportion * prop.proportion
        ),
        1 - prop.proportion,
      ];
      if (splits.length <= 1) {
        throw new Error('No splits for token ' + token.toString());
      }
      const balanceNode = EffectNode.balanceNode(token);
      const consumers = [
        ...prop.consumers.map((consumer) => consumer.consumer),
        balanceNode,
      ];

      const splitNode = new SplitNode(token, splits);
      this.splitNodes.push(splitNode);
      for (const consumer of consumers) {
        splitNode.forward(token, consumer);
      }
      previousNode.forward(token, splitNode);

      this.balanceNodeTip.set(token, balanceNode);
      return;
    }
    if (prop.consumers.length === 1) {
      previousNode.forward(token, prop.consumers[0].consumer);
      this.balanceNodeTip.set(token, prop.consumers[0].consumer);
      return;
    }

    let splits = prop.consumers.map((consumer) => consumer.proportion);
    const sum = splits.reduce((l, r) => l + r);
    splits = splits.map((split) => split / sum);

    const splitNode = new SplitNode(token, splits);
    this.splitNodes.push(splitNode);
    for (const { consumer } of prop.consumers) {
      splitNode.forward(token, consumer);
    }
    this.balanceNodeTip.delete(token);
  }

  private takeOpenSet(token: Token) {
    const prop = this.openTokenSet.get(token);
    if (prop == null) {
      throw new Error('No balance for token ' + token.toString());
    }
    this.openTokenSet.delete(token);
    this.normalizeProportions();
    return prop;
  }

  /**
   * Replace underived set:
   * Plan is valid all output tokens in the open set.
   *
   * All open set tokens must be produced by the plans.
   *
   * The DAG is modified in the following way:
   *  At least one producer is added pr open set token
   *  IF there is more than one consumer pr open set token, a split node is added between producer and consumer
   *  IF there is more than one producer consuming the same token a split ndoe is added
   *
   *  There will be single consumer pr open set token after this operation
   */
  public async replaceOpenSet(tokenDerivations: SwapPlan[]) {
    const openSet = this.openTokenSet;
    this.openTokenSet = new Map();

    const tokensToConsume = new Set<Token>();
    for (const token of openSet.keys()) {
      tokensToConsume.add(token);
    }

    const producers = new DefaultMap<Token, ActionNode[]>(() => []);
    const newOpenSetConsumers = new DefaultMap<Token, [number, DagNode][]>(() => []);
    for (const action of tokenDerivations) {
      const inputs = await action.inputProportions().then(i => i.map(qty => [qty.asNumber(), qty.token] as [number, Token]));
      const outputs = await action.outputProportions().then(i => i.map(qty => [qty.asNumber(), qty.token] as [number, Token]));
      const actionNode = new ActionNode(inputs, action, outputs);
      for (const outputToken of action.outputs) {
        if (!openSet.has(outputToken)) {
          throw new Error(
            `Cannot replace set: token ${outputToken} is not in the open set`
          );
        }
        if (tokensToConsume.has(outputToken)) {
          tokensToConsume.delete(outputToken);
        }
        producers.get(outputToken).push(actionNode);
      }

      for (const [proportion, inputToken] of inputs) {
        newOpenSetConsumers.get(inputToken).push([proportion, actionNode]);
      }
    }

    if (tokensToConsume.size !== 0) {
      throw new Error(
        `Cannot replace set: Every token in open set consumed; ${[...tokensToConsume].join(', ')} missing productions`
      );
    }

    const outputNodes = new DefaultMap<Token, [number, DagNode]>(token => {
      const consumers = openSet.get(token);
      if (consumers == null) {
        throw new Error(`Panic! Missing consumers for ${token}`);
      }

      if (consumers.consumers.length === 1) {
        return [consumers.proportion, consumers.consumers[0].consumer] as const;
      }
      const splits = consumers.consumers.map((consumer) => consumer.proportion);
      const sum = splits.reduce((l, r) => l + r);
      const splitNode = new SplitNode(token, splits.map((split) => split / sum));
      this.splitNodes.push(splitNode);
      for (const { consumer } of consumers.consumers) {
        splitNode.forward(token, consumer);
      }

      return [consumers.proportion, splitNode] as const;
    });

    for (const [outputToken, nodes] of producers.entries()) {
      let sum = 0.0;
      if (nodes.length === 0) {
        throw new Error(`Panic! No nodes for ${outputToken}`);
      }
      for (const node of nodes) {
        for (const [_, outputToken] of node.outputs) {
          const [proportion, forwardNode] = outputNodes.get(outputToken)!;
          node.forward(outputToken, forwardNode);
          sum += proportion;
        }
      }

      

      if (sum > 1.0) {
        throw new Error(`Panic! Sum of proportions for ${outputToken} is ${sum}`);
      }
      for(const node of nodes) {
        for(const input of node.inputs) {
          
        }
      }
      
      if (nodes.length === 1) {
        this.openTokenSet.set(newInput, {
          proportion: sum,
          consumers: [{ proportion: 1, consumer: nodes[0] }],
        });
      } else {
        const splits = nodes.map(node => node.getInputProportion(newInput));
        const splitNode = new SplitNode(newInput, splits);
        this.splitNodes.push(splitNode);
        for (const node of nodes) {
          splitNode.forward(newInput, node);
        }
        this.openTokenSet.set(newInput, {
          proportion: sum,
          consumers: [{ proportion: 1, consumer: splitNode }],
        });
      }
    }
    this.normalizeProportions();
  }
}
