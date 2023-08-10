import { Universe } from '../Universe';


export const loadRTokens = (universe: Universe) => Promise.all(Object.entries(universe.config.addresses.rTokenDeployments).map(
  ([key, mainAddr]) => {
    return universe.defineRToken(mainAddr, universe.config.addresses.rTokens[key]);
  }));
