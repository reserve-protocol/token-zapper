import { type Universe } from '../Universe'
import { type StaticConfig } from './StaticConfig'

export type InitializeUniverseFn = (universe: Universe) => Promise<void>
export interface ChainConfiguration {
  config: StaticConfig
  initialize: InitializeUniverseFn
}
