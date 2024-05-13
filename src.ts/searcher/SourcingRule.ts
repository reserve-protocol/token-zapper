import { type Searcher } from '../searcher/Searcher';
import { type Token, type TokenQuantity } from '../entities/Token';
import { BasketTokenSourcingRuleApplication } from './BasketTokenSourcingRules';



export type SourcingRule = (
  input: Token,
  prUnitBasketTokenQuantity: TokenQuantity,
  searcher: Searcher<any>,
  unitBasket: TokenQuantity[],
) => Promise<BasketTokenSourcingRuleApplication>;
