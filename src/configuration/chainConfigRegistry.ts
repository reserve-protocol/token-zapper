import ethereum from './ethereum'
import { type ChainConfiguration } from './ChainConfiguration'
export const predefinedConfigurations: Record<number, ChainConfiguration> = {
  1: ethereum,
}
