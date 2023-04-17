import ethereum from './ethereum'
import { type ChainConfiguration } from './ChainConfiguration'

/**
 * A map of chain IDs to chain configurations.
 */
export const predefinedConfigurations: Record<number, ChainConfiguration> = {
  1: ethereum,
}
