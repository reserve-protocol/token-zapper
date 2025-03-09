import { ILoggerType } from '../configuration/ZapSimulation'

/**
 * Options for the Nelder-Mead algorithm
 */
export interface NelderMeadOptions {
  maxIterations?: number
  tolerance?: number
  alphaOptions?: number[] // reflection coefficient
  gammaOptions?: number[] // expansion coefficient
  rhoOptions?: number[] // contraction coefficient
  sigmaOptions?: number[] // shrink coefficient
  perturbation?: number // perturbation coefficient
  maxTime?: number

  restartAfterNoChangeIterations?: number
  maxStepsPerRestart?: number
  maxRestarts?: number
}

function sumInPlace(arr: number[], startIdx: number, endIdx: number) {
  let sum = 0
  let min = Infinity
  for (let i = startIdx; i < endIdx; i++) {
    arr[i] = Math.max(arr[i], 0)
    sum += arr[i]
    min = Math.min(min, arr[i])
  }
  return [sum, min]
}

function normalizeInPlace(
  arr: number[],
  startIdx: number,
  endIdx: number,
  paramSum: number
) {
  for (let i = startIdx; i < endIdx; i++) {
    arr[i] /= paramSum
  }
}

function updateInPlace(
  arr: number[],
  startIdx: number,
  endIdx: number,
  value: number
) {
  for (let i = startIdx; i < endIdx; i++) {
    arr[i] = value
  }
}

/**
 * Helper: Normalize portions of the flattened vector that correspond to each split node.
 * @param flatVector - The complete parameter vector
 * @param nodeDimensions - List of dimensions for each node, e.g., [4, 3, 5]
 * @returns Normalized vector where each split node's proportions sum to 1
 */
export function normalizeVectorByNodes(
  flatVector: number[],
  nodeDimensions: number[]
): number[] {
  const result = [...flatVector]
  let startIdx = 0

  for (const dim of nodeDimensions) {
    const endIdx = startIdx + dim
    // Normalize to sum to 1, handling the case where all values are zero
    let [paramSum, min] = sumInPlace(result, startIdx, endIdx)
    if (min < 0) {
      paramSum = 0
      for (let i = startIdx; i < endIdx; i++) {
        result[i] += min
        paramSum += result[i]
      }
    }
    if (paramSum > 0) {
      normalizeInPlace(result, startIdx, endIdx, paramSum)
    } else {
      // If all values are zero, set equal proportions
      updateInPlace(result, startIdx, endIdx, 1 / dim)
    }

    startIdx = endIdx
  }

  return result
}

/**
 * Initialize the simplex by creating n+1 vertices where n is the dimensionality.
 * Each new vertex is created by perturbing one coordinate of the initial point.
 */
function initializeSimplex(
  initialPoint: number[],
  // normalizeFunc: (params: number[]) => number[],
  perturbation: number = 0.25
): number[][] {
  const n = initialPoint.length
  const simplex: number[][] = Array(n + 1)
    .fill(null)
    .map(() => Array(n).fill(0))

  // First vertex is the initial point
  simplex[0] = [...initialPoint]

  // Create remaining vertices by perturbing each dimension
  for (let i = 0; i < n; i++) {
    const vertex = [...initialPoint]
    // Perturb the i-th component while ensuring it stays positive
    vertex[i] = Math.max(vertex[i] * (1 + perturbation), perturbation)
    simplex[i + 1] = vertex
  }

  // Normalize each vertex to maintain valid proportions
  // for (let i = 0; i < n + 1; i++) {
  //   simplex[i] = normalizeFunc(simplex[i])
  // }

  return simplex
}

/**
 * Check if the simplex has converged by measuring its size.
 */
function checkConvergence(
  logger: ILoggerType,
  simplex: number[][],
  tolerance: number
): boolean {
  const bestVertex = simplex[0]

  // Calculate maximum distance from best to any other vertex
  let maxDistance = 0
  for (let i = 1; i < simplex.length; i++) {
    let sum = 0
    for (let j = 0; j < simplex[i].length; j++) {
      sum += Math.pow(simplex[i][j] - bestVertex[j], 2)
    }
    maxDistance = Math.max(maxDistance, Math.sqrt(sum))
  }

  return maxDistance < tolerance
}

/**
 * Shrink the simplex towards the best vertex.
 */
async function shrinkSimplex(
  simplex: number[][],
  functionValues: number[],
  objectiveFunc: (params: number[], iteration: number) => Promise<number>,
  // normalizeFunc: (params: number[]) => number[],
  sigma: number
): Promise<void> {
  const n = simplex.length - 1
  const bestVertex = simplex[0]

  for (let i = 1; i <= n; i++) {
    // Shrink towards best vertex
    simplex[i] = bestVertex.map(
      (val, idx) => val + sigma * (simplex[i][idx] - val)
    )

    // Normalize to maintain valid proportions
    simplex[i] = simplex[i]

    // Evaluate the new vertex
    functionValues[i] = await objectiveFunc(simplex[i], -1)
  }
}

export const memorizeObjFunction = (
  objectiveFunc: (params: number[], iteration: number) => Promise<number>
): ((params: number[], iteration: number) => Promise<number>) => {
  const previouslyEvaluated = new Map<string, Promise<number>>()
  return async (params: number[], iteration: number) => {
    const k = params.join(',')
    if (previouslyEvaluated.has(k)) {
      return await previouslyEvaluated.get(k)!
    }
    const result = objectiveFunc(params, iteration)
    previouslyEvaluated.set(k, result)
    return await result
  }
}

/**
 * Implements the Nelder-Mead optimization algorithm specialized for token flow graphs.
 *
 * @param objectiveFunc - Async function to minimize, should handle unnormalized parameters
 * @param initialParams - Starting point, a flattened vector of all split node proportions
 * @param normalizeFunc - Function to normalize parameter vectors for each split node
 * @param options - Algorithm parameters
 *
 * @returns The best parameter vector found
 */
export async function nelderMeadOptimize(
  initialParams: number[],
  objectiveFunc: (params: number[], iteration: number) => Promise<number>,
  logger: ILoggerType,
  options: NelderMeadOptions = {},
  normalize: (params: number[]) => number[] = (params) => params
): Promise<number[]> {
  // Set default options
  let {
    maxIterations = 200,
    tolerance = 1e-6,
    alphaOptions = [1.0],
    gammaOptions = [2.0],
    rhoOptions = [0.5],
    sigmaOptions = [0.5],
    restartAfterNoChangeIterations: restartIts = 20,
    maxStepsPerRestart = Infinity,
    maxRestarts = 1,
    perturbation = 0.2,
    maxTime = Infinity,
  } = options

  const startTime = Date.now()
  if (Date.now() - startTime > maxTime) {
    return initialParams
  }

  // Dimensionality of the problem
  const n = initialParams.length

  let restarts = 0
  let iteration = 0
  let marginalImprovementCount = 0
  // Initialize the simplex
  let simplex = initializeSimplex(initialParams, perturbation)

  // Evaluate each vertex in the simplex
  let functionValues: number[] = await Promise.all(
    simplex.map((vertex) => objectiveFunc(vertex, -1))
  )
  const centroid = Array(n).fill(0)

  const sortState = () => {
    const data = simplex.map((vertex, index) => ({
      vertex,
      value: functionValues[index],
    }))
    data.sort((a, b) => a.value - b.value)
    for (let i = 0; i < simplex.length; i++) {
      simplex[i] = data[i].vertex
      functionValues[i] = data[i].value
    }
  }
  let alpha = alphaOptions[0]
  let gamma = gammaOptions[0]
  let rho = rhoOptions[0]
  let sigma = sigmaOptions[0]
  let running = true
  logger = logger.child({
    prefix: `nelder-mead`,
    restart: 0,
    alpha,
    gamma,
    rho,
    sigma,
  })
  const log = (msg: string) => {
    if (process.env.DEV) {
      logger.info(msg)
    } else {
      logger.debug(msg)
    }
  }
  let stepsSinceRestart = 0

  const restart = async () => {
    restarts += 1

    const perp = perturbation * 0.75 ** restarts

    stepsSinceRestart = 0
    marginalImprovementCount = 0

    // Ignore restarts if we're close to the max time
    if (Date.now() - startTime > maxTime - 1000) {
      return
    }
    log(
      `Restarting... perturbation=${perp}, alpha=${alpha}, gamma=${gamma}, rho=${rho}, sigma=${sigma}`
    )
    alpha = alphaOptions[restarts % alphaOptions.length]
    gamma = gammaOptions[restarts % gammaOptions.length]
    rho = rhoOptions[restarts % rhoOptions.length]
    sigma = sigmaOptions[restarts % sigmaOptions.length]

    logger = logger.child({
      prefix: `nelder-mead`,
      restart: restarts,
      alpha,
      gamma,
      rho,
      sigma,
    })

    const bestSimplex = normalize(simplex[0])

    simplex = initializeSimplex(bestSimplex, perp)
    // Evaluate each vertex in the simplex
    functionValues = await Promise.all(
      simplex.map((vertex) => objectiveFunc(vertex, iteration))
    )
    perturbation = perp
  }
  try {
    while (iteration < maxIterations) {
      stepsSinceRestart += 1
      if (Date.now() - startTime > maxTime) {
        log(`Max time reached`)
        break
      }

      if (stepsSinceRestart > maxStepsPerRestart) {
        log(`Restarting due to max steps per restart`)
        await restart()
      }

      let prevBest = functionValues[0]
      for (; iteration < maxIterations; iteration++) {
        if (Date.now() - startTime > maxTime) {
          log(`Max time reached`)
          running = false
          break
        }

        sortState()

        const ratio = functionValues[0] / prevBest
        prevBest = functionValues[0]
        if (ratio < 1.0) {
          perturbation *= ratio
        }

        if (ratio > 0.999) {
          marginalImprovementCount += 1
        } else {
          marginalImprovementCount = 0
        }

        if (marginalImprovementCount > restartIts && restarts < maxRestarts) {
          log(`Restarting due to slow rate of improvements`)
          await restart()
          break
        }

        // If there is less than

        // Check termination criterion: size of simplex < tolerance
        if (checkConvergence(logger, simplex, tolerance)) {
          running = false
          break
        }

        // Compute centroid of all points except the worst
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            centroid[j] += simplex[i][j]
          }
        }
        for (let j = 0; j < n; j++) {
          centroid[j] /= n
        }

        // Reflection: reflect the worst point through the centroid
        const xReflected = centroid.map(
          (val, idx) => val + alpha * (val - simplex[n][idx])
        )

        // Normalize the reflected point to maintain valid proportions
        const fReflected = await objectiveFunc(xReflected, iteration)

        if (
          functionValues[0] <= fReflected &&
          fReflected < functionValues[n - 1]
        ) {
          // console.log(`Reflection`)
          // Reflection is better than worst but not best, replace worst point
          simplex[n] = xReflected
          functionValues[n] = fReflected
        } else if (fReflected < functionValues[0]) {
          // Reflection is best so far, try expansion
          const xExpanded = centroid.map(
            (val, idx) => val + gamma * (xReflected[idx] - val)
          )
          const fExpanded = await objectiveFunc(xExpanded, iteration)

          if (fExpanded < fReflected) {
            // console.log(`Expansion`)
            // Expansion is better than reflection
            simplex[n] = xExpanded
            functionValues[n] = fExpanded
          } else {
            // console.log(`Reflection`)
            // Stick with reflection
            simplex[n] = xReflected
            functionValues[n] = fReflected
          }
        } else {
          // Reflection is still worst, need to contract
          const xContracted = centroid.map(
            (val, idx) => val + rho * (simplex[n][idx] - val)
          )
          const fContracted = await objectiveFunc(xContracted, iteration)
          if (fContracted < functionValues[n]) {
            // console.log(`Contraction`)
            // Contraction is better than worst
            simplex[n] = xContracted
            functionValues[n] = fContracted
          } else {
            // console.log(`Shrink`)
            // Contraction didn't help, shrink the simplex
            log(`Shrinking simplex`)
            await shrinkSimplex(simplex, functionValues, objectiveFunc, sigma)
          }
        }
      }
      if (!running) {
        break
      }
    }
  } catch (e) {}
  sortState()
  return simplex[0]
}
