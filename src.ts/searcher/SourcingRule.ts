import { type Searcher } from '../searcher/Searcher';
import { type Token, type TokenQuantity } from '../entities/Token';
import { BasketTokenSourcingRuleApplication } from './BasketTokenSourcingRules';



export type SourcingRule = (
  userInputToken: Token,
  heldQuantity: TokenQuantity,
  searcher: Searcher<any>
) => Promise<BasketTokenSourcingRuleApplication>;
