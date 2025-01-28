// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";


interface IMaverickV2Pool {
    error PoolZeroLiquidityAdded();
    error PoolMinimumLiquidityNotMet();
    error PoolLocked();
    error PoolInvalidFee();
    error PoolTicksNotSorted(uint256 index, int256 previousTick, int256 tick);
    error PoolTicksAmountsLengthMismatch(uint256 ticksLength, uint256 amountsLength);
    error PoolBinIdsAmountsLengthMismatch(uint256 binIdsLength, uint256 amountsLength);
    error PoolKindNotSupported(uint256 kinds, uint256 kind);
    error PoolInsufficientBalance(uint256 deltaLpAmount, uint256 accountBalance);
    error PoolReservesExceedMaximum(uint256 amount);
    error PoolValueExceedsBits(uint256 amount, uint256 bits);
    error PoolTickMaxExceeded(uint256 tick);
    error PoolMigrateBinFirst();
    error PoolCurrentTickBeyondSwapLimit(int32 startingTick);
    error PoolSenderNotAccessor(address sender_, address accessor);
    error PoolSenderNotFactory(address sender_, address accessor);
    error PoolFunctionNotImplemented();
    error PoolTokenNotSolvent(uint256 internalReserve, uint256 tokenBalance, IERC20 token);

    event PoolSwap(address sender, address recipient, SwapParams params, uint256 amountIn, uint256 amountOut);

    event PoolAddLiquidity(
        address sender,
        address recipient,
        uint256 subaccount,
        AddLiquidityParams params,
        uint256 tokenAAmount,
        uint256 tokenBAmount,
        uint32[] binIds
    );

    event PoolMigrateBinsUpStack(address sender, uint32 binId, uint32 maxRecursion);

    event PoolRemoveLiquidity(
        address sender,
        address recipient,
        uint256 subaccount,
        RemoveLiquidityParams params,
        uint256 tokenAOut,
        uint256 tokenBOut
    );

    event PoolSetVariableFee(uint256 newFeeAIn, uint256 newFeeBIn);

    /**
     * @notice Tick state parameters.
     */
    struct TickState {
        uint128 reserveA;
        uint128 reserveB;
        uint128 totalSupply;
        uint32[4] binIdsByTick;
    }

    /**
     * @notice Tick data parameters.
     * @param currentReserveA Current reserve of token A.
     * @param currentReserveB Current reserve of token B.
     * @param currentLiquidity Current liquidity amount.
     */
    struct TickData {
        uint256 currentReserveA;
        uint256 currentReserveB;
        uint256 currentLiquidity;
    }

    /**
     * @notice Bin state parameters.
     * @param mergeBinBalance LP token balance that this bin possesses of the merge bin.
     * @param mergeId Bin ID of the bin that this bin has merged into.
     * @param totalSupply Total amount of LP tokens in this bin.
     * @param kind One of the 4 kinds (0=static, 1=right, 2=left, 3=both).
     * @param tick The lower price tick of the bin in its current state.
     * @param tickBalance Balance of the tick.
     */
    struct BinState {
        uint128 mergeBinBalance;
        uint128 tickBalance;
        uint128 totalSupply;
        uint8 kind;
        int32 tick;
        uint32 mergeId;
    }

    /**
     * @notice Parameters for swap.
     * @param amount Amount of the token that is either the input if exactOutput is false
     * or the output if exactOutput is true.
     * @param tokenAIn Boolean indicating whether tokenA is the input.
     * @param exactOutput Boolean indicating whether the amount specified is
     * the exact output amount (true).
     * @param tickLimit The furthest tick a swap will execute in. If no limit
     * is desired, value should be set to type(int32).max for a tokenAIn swap
     * and type(int32).min for a swap where tokenB is the input.
     */
    struct SwapParams {
        uint256 amount;
        bool tokenAIn;
        bool exactOutput;
        int32 tickLimit;
    }

    /**
     * @notice Parameters associated with adding liquidity.
     * @param kind One of the 4 kinds (0=static, 1=right, 2=left, 3=both).
     * @param ticks Array of ticks to add liquidity to.
     * @param amounts Array of bin LP amounts to add.
     */
    struct AddLiquidityParams {
        uint8 kind;
        int32[] ticks;
        uint128[] amounts;
    }

    /**
     * @notice Parameters for each bin that will have liquidity removed.
     * @param binIds Index array of the bins losing liquidity.
     * @param amounts Array of bin LP amounts to remove.
     */
    struct RemoveLiquidityParams {
        uint32[] binIds;
        uint128[] amounts;
    }

    /**
     * @notice State of the pool.
     * @param reserveA Pool tokenA balanceOf at end of last operation
     * @param reserveB Pool tokenB balanceOf at end of last operation
     * @param lastTwaD8 Value of log time weighted average price at last block.
     * Value is 8-decimal scale and is in the fractional tick domain.  E.g. a
     * value of 12.3e8 indicates the TWAP was 3/10ths of the way into the 12th
     * tick.
     * @param lastLogPriceD8 Value of log price at last block. Value is
     * 8-decimal scale and is in the fractional tick domain.  E.g. a value of
     * 12.3e8 indicates the price was 3/10ths of the way into the 12th tick.
     * @param lastTimestamp Last block.timestamp value in seconds for latest
     * swap transaction.
     * @param activeTick Current tick position that contains the active bins.
     * @param isLocked Pool isLocked, E.g., locked or unlocked; isLocked values
     * defined in Pool.sol.
     * @param binCounter Index of the last bin created.
     * @param protocolFeeRatioD3 Ratio of the swap fee that is kept for the
     * protocol.
     */
    struct State {
        uint128 reserveA;
        uint128 reserveB;
        int64 lastTwaD8;
        int64 lastLogPriceD8;
        uint40 lastTimestamp;
        int32 activeTick;
        bool isLocked;
        uint32 binCounter;
        uint8 protocolFeeRatioD3;
    }

    /**
     * @notice Internal data used for data passing between Pool and Bin code.
     */
    struct BinDelta {
        uint128 deltaA;
        uint128 deltaB;
    }

    /**
     * @notice 1-15 number to represent the active kinds.
     * @notice 0b0001 = static;
     * @notice 0b0010 = right;
     * @notice 0b0100 = left;
     * @notice 0b1000 = both;
     *
     * E.g. a pool with all 4 modes will have kinds = b1111 = 15
     */
    function kinds() external view returns (uint8 _kinds);

    /**
     * @notice Returns whether a pool has permissioned functions. If true, the
     * `accessor()` of the pool can set the pool fees.  Other functions in the
     * pool may also be permissioned; whether or not they are can be determined
     * through calls to `permissionedLiquidity()` and `permissionedSwap()`.
     */
    function permissionedPool() external view returns (bool _permissionedPool);

    /**
     * @notice Returns whether a pool has permissioned liquidity management
     * functions. If true, the pool is incompatible with permissioned pool
     * liquidity management infrastructure.
     */
    function permissionedLiquidity() external view returns (bool _permissionedLiquidity);

    /**
     * @notice Returns whether a pool has a permissioned swap functions. If
     * true, the pool is incompatible with permissioned pool swap router
     * infrastructure.
     */
    function permissionedSwap() external view returns (bool _permissionedSwap);

    /**
     * @notice Pool swap fee for the given direction (A-in or B-in swap) in
     * 18-decimal format. E.g. 0.01e18 is a 1% swap fee.
     */
    function fee(bool tokenAIn) external view returns (uint256);

    /**
     * @notice TickSpacing of pool where 1.0001^tickSpacing is the bin width.
     */
    function tickSpacing() external view returns (uint256);

    /**
     * @notice Lookback period of pool in seconds.
     */
    function lookback() external view returns (uint256);

    /**
     * @notice Address of Pool accessor.  This is Zero address for
     * permissionless pools.
     */
    function accessor() external view returns (address);

    /**
     * @notice Pool tokenA.  Address of tokenA is such that tokenA < tokenB.
     */
    function tokenA() external view returns (IERC20);

    /**
     * @notice Pool tokenB.
     */
    function tokenB() external view returns (IERC20);

    /**
     * @notice Deploying factory of the pool and also contract that has ability
     * to set and collect protocol fees for the pool.
     */
    function factory() external view returns (address);

    /**
     * @notice Most significant bit of scale value is a flag to indicate whether
     * tokenA has more or less than 18 decimals.  Scale is used in conjuction
     * with Math.toScale/Math.fromScale functions to convert from token amounts
     * to D18 scale internal pool accounting.
     */
    function tokenAScale() external view returns (uint256);

    /**
     * @notice Most significant bit of scale value is a flag to indicate whether
     * tokenA has more or less than 18 decimals.  Scale is used in conjuction
     * with Math.toScale/Math.fromScale functions to convert from token amounts
     * to D18 scale internal pool accounting.
     */
    function tokenBScale() external view returns (uint256);

    /**
     * @notice ID of bin at input tick position and kind.
     */
    function binIdByTickKind(int32 tick, uint256 kind) external view returns (uint32);

    /**
     * @notice Accumulated tokenA protocol fee.
     */
    function protocolFeeA() external view returns (uint128);

    /**
     * @notice Accumulated tokenB protocol fee.
     */
    function protocolFeeB() external view returns (uint128);

    /**
     * @notice Lending fee rate on flash loans.
     */
    function lendingFeeRateD18() external view returns (uint256);

    /**
     * @notice External function to get the current time-weighted average price.
     */
    function getCurrentTwa() external view returns (int256);

    /**
     * @notice External function to get the state of the pool.
     */
    function getState() external view returns (State memory);

    /**
     * @notice Return state of Bin at input binId.
     */
    function getBin(uint32 binId) external view returns (BinState memory bin);

    /**
     * @notice Return state of Tick at input tick position.
     */
    function getTick(int32 tick) external view returns (TickState memory tickState);

    /**
     * @notice Retrieves the balance of a user within a bin.
     * @param user The user's address.
     * @param subaccount The subaccount for the user.
     * @param binId The ID of the bin.
     */
    function balanceOf(address user, uint256 subaccount, uint32 binId) external view returns (uint128 lpToken);

    /**
     * @notice Add liquidity to a pool. This function allows users to deposit
     * tokens into a liquidity pool.
     * @dev This function will call `maverickV2AddLiquidityCallback` on the
     * calling contract to collect the tokenA/tokenB payment.
     * @param recipient The account that will receive credit for the added liquidity.
     * @param subaccount The account that will receive credit for the added liquidity.
     * @param params Parameters containing the details for adding liquidity,
     * such as token types and amounts.
     * @param data Bytes information that gets passed to the callback.
     * @return tokenAAmount The amount of token A added to the pool.
     * @return tokenBAmount The amount of token B added to the pool.
     * @return binIds An array of bin IDs where the liquidity is stored.
     */
    function addLiquidity(
        address recipient,
        uint256 subaccount,
        AddLiquidityParams calldata params,
        bytes calldata data
    ) external returns (uint256 tokenAAmount, uint256 tokenBAmount, uint32[] memory binIds);

    /**
     * @notice Removes liquidity from the pool.
     * @dev Liquidy can only be removed from a bin that is either unmerged or
     * has a mergeId of an unmerged bin.  If a bin is merged more than one
     * level deep, it must be migrated up the merge stack to the root bin
     * before liquidity removal.
     * @param recipient The address to receive the tokens.
     * @param subaccount The subaccount for the recipient.
     * @param params The parameters for removing liquidity.
     * @return tokenAOut The amount of token A received.
     * @return tokenBOut The amount of token B received.
     */
    function removeLiquidity(
        address recipient,
        uint256 subaccount,
        RemoveLiquidityParams calldata params
    ) external returns (uint256 tokenAOut, uint256 tokenBOut);

    /**
     * @notice Migrate bins up the linked list of merged bins so that its
     * mergeId is the currrent active bin.
     * @dev Liquidy can only be removed from a bin that is either unmerged or
     * has a mergeId of an unmerged bin.  If a bin is merged more than one
     * level deep, it must be migrated up the merge stack to the root bin
     * before liquidity removal.
     * @param binId The ID of the bin to migrate.
     * @param maxRecursion The maximum recursion depth for the migration.
     */
    function migrateBinUpStack(uint32 binId, uint32 maxRecursion) external;

    /**
     * @notice Swap tokenA/tokenB assets in the pool.  The swap user has two
     * options for funding their swap.
     * - The user can push the input token amount to the pool before calling
     * the swap function. In order to avoid having the pool call the callback,
     * the user should pass a zero-length `data` bytes object with the swap
     * call.
     * - The user can send the input token amount to the pool when the pool
     * calls the `maverickV2SwapCallback` function on the calling contract.
     * That callback has input parameters that specify the token address of the
     * input token, the input and output amounts, and the bytes data sent to
     * the swap function.
     * @dev  If the users elects to do a callback-based swap, the output
     * assets will be sent before the callback is called, allowing the user to
     * execute flash swaps.  However, the pool does have reentrancy protection,
     * so a swapper will not be able to interact with the same pool again
     * while they are in the callback function.
     * @param recipient The address to receive the output tokens.
     * @param params Parameters containing the details of the swap
     * @param data Bytes information that gets passed to the callback.
     */
    function swap(
        address recipient,
        SwapParams memory params,
        bytes calldata data
    ) external returns (uint256 amountIn, uint256 amountOut);

    /**
     * @notice Loan tokenA/tokenB assets from the pool to recipient. The fee
     * rate of a loan is determined by `lendingFeeRateD18`, which is set at the
     * protocol level by the factory.  This function calls
     * `maverickV2FlashLoanCallback` on the calling contract.  At the end of
     * the callback, the caller must pay back the loan with fee (if there is a
     * fee).
     * @param recipient The address to receive the loaned tokens.
     * @param amountB Loan amount of tokenA sent to recipient.
     * @param amountB Loan amount of tokenB sent to recipient.
     * @param data Bytes information that gets passed to the callback.
     */
    function flashLoan(
        address recipient,
        uint256 amountA,
        uint256 amountB,
        bytes calldata data
    ) external returns (uint128 lendingFeeA, uint128 lendingFeeB);

    /**
     * @notice Sets fee for permissioned pools.  May only be called by the
     * accessor.
     */
    function setFee(uint256 newFeeAIn, uint256 newFeeBIn) external;
}
interface IMaverickV2PoolLens {
  error LensTargetPriceOutOfBounds(uint256 targetSqrtPrice, uint256 sqrtLowerTickPrice, uint256 sqrtUpperTickPrice);
  error LensTooLittleLiquidity(uint256 relativeLiquidityAmount, uint256 deltaA, uint256 deltaB);
  error LensTargetingTokenWithNoDelta(bool targetIsA, uint256 deltaA, uint256 deltaB);

  /**
   * @notice Add liquidity slippage parameters for a distribution of liquidity.
   * @param pool Pool where liquidity is being added.
   * @param kind Bin kind; all bins must have the same kind in a given call
   * to addLiquidity.
   * @param ticks Array of tick values to add liquidity to.
   * @param relativeLiquidityAmounts Relative liquidity amounts for the
   * specified ticks.  Liquidity in this case is not bin LP balance, it is
   * the bin liquidity as defined by liquidity = deltaA / (sqrt(upper) -
   * sqrt(lower)) or deltaB = liquidity / sqrt(lower) - liquidity /
   * sqrt(upper).
   * @param addSpec Slippage specification.
   */
  struct AddParamsViewInputs {
      address pool;
      uint8 kind;
      int32[] ticks;
      uint128[] relativeLiquidityAmounts;
      AddParamsSpecification addSpec;
  }

  /**
   * @notice Multi-price add param specification.
   * @param slippageFactorD18 Max slippage allowed as a percent in D18 scale. e.g. 1% slippage is 0.01e18
   * @param numberOfPriceBreaksPerSide Number of price break values on either
   * side of current price.
   * @param targetAmount Target token contribution amount in tokenA if
   * targetIsA is true, otherwise this is the target amount for tokenB.
   * @param targetIsA  Indicates if the target amount is for tokenA or tokenB
   */
  struct AddParamsSpecification {
      uint256 slippageFactorD18;
      uint256 numberOfPriceBreaksPerSide;
      uint256 targetAmount;
      bool targetIsA;
  }

  /**
   * @notice Boosted position creation specification and add parameters.
   * @param bpSpec Boosted position kind/binId/ratio information.
   * @param packedSqrtPriceBreaks Array of sqrt price breaks packed into
   * bytes.  These breaks act as a lookup table for the packedArgs array to
   * indicate to the Liquidity manager what add liquidity parameters from
   * packedArgs to use depending on the price of the pool at add time.
   * @param packedArgs Array of bytes arguments.  Each array element is a
   * packed version of addLiquidity paramters.
   */
  struct CreateBoostedPositionInputs {
      BoostedPositionSpecification bpSpec;
      bytes packedSqrtPriceBreaks;
      bytes[] packedArgs;
  }

  /**
   * @notice Specification for deriving create pool parameters. Creating a pool in the liquidity manager has several steps:
   *
   * - Deploy pool
   * - Donate a small amount of initial liquidity in the activeTick
   * - Execute a small swap to set the pool price to the desired value
   * - Add liquidity
   *
   * In order to execute these steps, the caller must specify the parameters
   * of each step.  The PoolLens has helper function to derive the values
   * used by the LiquidityManager, but this struct is the input to that
   * helper function and represents the core intent of the pool creator.
   *
   * @param fee Fraction of the pool swap amount that is retained as an LP in
   * D18 scale.
   * @param tickSpacing Tick spacing of pool where 1.0001^tickSpacing is the
   * bin width.
   * @param lookback Pool lookback in seconds.
   * @param tokenA Address of tokenA.
   * @param tokenB Address of tokenB.
   * @param activeTick Tick position that contains the active bins.
   * @param kinds 1-15 number to represent the active kinds
   * 0b0001 = static;
   * 0b0010 = right;
   * 0b0100 = left;
   * 0b1000 = both.
   * e.g. a pool with all 4 modes will have kinds = b1111 = 15
   * @param initialTargetB Amount of B to be donated to the pool after pool
   * create.  This amount needs to be big enough to meet the minimum bin
   * liquidity.
   * @param sqrtPrice Target sqrt price of the pool.
   * @param kind Bin kind; all bins must have the same kind in a given call
   * to addLiquidity.
   * @param ticks Array of tick values to add liquidity to.
   * @param relativeLiquidityAmounts Relative liquidity amounts for the
   * specified ticks.  Liquidity in this case is not bin LP balance, it is
   * the bin liquidity as defined by liquidity = deltaA / (sqrt(upper) -
   * sqrt(lower)) or deltaB = liquidity / sqrt(lower) - liquidity /
   * sqrt(upper).
   * @param targetAmount Target token contribution amount in tokenA if
   * targetIsA is true, otherwise this is the target amount for tokenB.
   * @param targetIsA  Indicates if the target amount is for tokenA or tokenB
   */
  struct CreateAndAddParamsViewInputs {
      uint64 feeAIn;
      uint64 feeBIn;
      uint16 tickSpacing;
      uint32 lookback;
      IERC20 tokenA;
      IERC20 tokenB;
      int32 activeTick;
      uint8 kinds;
      // donate params
      uint256 initialTargetB;
      uint256 sqrtPrice;
      // add target
      uint8 kind;
      int32[] ticks;
      uint128[] relativeLiquidityAmounts;
      uint256 targetAmount;
      bool targetIsA;
  }

  struct Output {
      uint256 deltaAOut;
      uint256 deltaBOut;
      uint256[] deltaAs;
      uint256[] deltaBs;
      uint128[] deltaLpBalances;
  }

  struct Reserves {
      uint256 amountA;
      uint256 amountB;
  }

  struct BinPositionKinds {
      uint128[4] values;
  }

  struct PoolState {
      IMaverickV2Pool.TickState[] tickStateMapping;
      IMaverickV2Pool.BinState[] binStateMapping;
      BinPositionKinds[] binIdByTickKindMapping;
      IMaverickV2Pool.State state;
      Reserves protocolFees;
  }

  struct BoostedPositionSpecification {
      IMaverickV2Pool pool;
      uint32[] binIds;
      uint128[] ratios;
      uint8 kind;
  }

  struct CreateAndAddParamsInputs {
      uint64 feeAIn;
      uint64 feeBIn;
      uint16 tickSpacing;
      uint32 lookback;
      IERC20 tokenA;
      IERC20 tokenB;
      int32 activeTick;
      uint8 kinds;
      // donate params
      IMaverickV2Pool.AddLiquidityParams donateParams;
      // swap params
      uint256 swapAmount;
      // add params
      IMaverickV2Pool.AddLiquidityParams addParams;
      bytes[] packedAddParams;
      uint256 deltaAOut;
      uint256 deltaBOut;
      uint256 preAddReserveA;
      uint256 preAddReserveB;
  }

  struct TickDeltas {
      uint256 deltaAOut;
      uint256 deltaBOut;
      uint256[] deltaAs;
      uint256[] deltaBs;
  }

  /**
   * @notice Converts add parameter slippage specification into add
   * parameters.  The return values are given in both raw format and as packed
   * values that can be used in the LiquidityManager contract.
   */
  function getAddLiquidityParams(
      AddParamsViewInputs memory params
  )
      external
      view
      returns (
          bytes memory packedSqrtPriceBreaks,
          bytes[] memory packedArgs,
          uint88[] memory sqrtPriceBreaks,
          IMaverickV2Pool.AddLiquidityParams[] memory addParams,
          IMaverickV2PoolLens.TickDeltas[] memory tickDeltas
      );

  /**
   * @notice Converts add parameter slippage specification and boosted
   * position specification into add parameters.  The return values are given
   * in both raw format and as packed values that can be used in the
   * LiquidityManager contract.
   */
  function getCreateBoostedPositionParams(
      BoostedPositionSpecification memory bpSpec,
      AddParamsSpecification memory addSpec
  )
      external
      view
      returns (
          bytes memory packedSqrtPriceBreaks,
          bytes[] memory packedArgs,
          uint88[] memory sqrtPriceBreaks,
          IMaverickV2Pool.AddLiquidityParams[] memory addParams,
          IMaverickV2PoolLens.TickDeltas[] memory tickDeltas
      );

  /**
   * @notice Converts add parameter slippage specification and new pool
   * specification into CreateAndAddParamsInputs parameters that can be used in the
   * LiquidityManager contract.
   */
  function getCreatePoolAtPriceAndAddLiquidityParams(
      CreateAndAddParamsViewInputs memory params,
      address factory
  ) external view returns (CreateAndAddParamsInputs memory output);

  /**
   * @notice View function that provides information about pool ticks within
   * a tick radius from the activeTick. Ticks with no reserves are not
   * included in part o f the return array.
   */
  function getTicksAroundActive(
      IMaverickV2Pool pool,
      int32 tickRadius
  ) external view returns (int32[] memory ticks, IMaverickV2Pool.TickState[] memory tickStates);

  /**
   * @notice View function that provides information about pool ticks within
   * a range. Ticks with no reserves are not included in part o f the return
   * array.
   */
  function getTicks(
      IMaverickV2Pool pool,
      int32 tickStart,
      int32 tickEnd
  ) external view returns (int32[] memory ticks, IMaverickV2Pool.TickState[] memory tickStates);

  /**
   * @notice View function that provides information about pool ticks within
   * a range.  Information returned includes all pool state needed to emulate
   * a swap off chain. Ticks with no reserves are not included in part o f
   * the return array.
   */
  function getTicksAroundActiveWLiquidity(
      IMaverickV2Pool pool,
      int32 tickRadius
  )
      external
      view
      returns (
          int32[] memory ticks,
          IMaverickV2Pool.TickState[] memory tickStates,
          uint256[] memory liquidities,
          uint256[] memory sqrtLowerTickPrices,
          uint256[] memory sqrtUpperTickPrices,
          IMaverickV2Pool.State memory poolState,
          uint256 sqrtPrice,
          uint256 feeAIn,
          uint256 feeBIn
      );

  /**
   * @notice View function that provides pool state information.
   */
  function getFullPoolState(
      IMaverickV2Pool pool,
      uint32 binStart,
      uint32 binEnd
  ) external view returns (PoolState memory poolState);

  /**
   * @notice View function that provides price and liquidity of a given tick.
   */
  function getTickSqrtPriceAndL(
      IMaverickV2Pool pool,
      int32 tick
  ) external view returns (uint256 sqrtPrice, uint256 liquidity);

  /**
   * @notice Pool sqrt price.
   */
  function getPoolSqrtPrice(IMaverickV2Pool pool) external view returns (uint256 sqrtPrice);

  /**
   * @notice Pool price.
   */
  function getPoolPrice(IMaverickV2Pool pool) external view returns (uint256 price);

  /**
   * @notice Token scale of two tokens in a pool.
   */
  function tokenScales(IMaverickV2Pool pool) external view returns (uint256 tokenAScale, uint256 tokenBScale);
}


interface IMaverickV2Quoter {
    /**
     * @notice Calculates a swap on a MaverickV2Pool and returns the resulting
     * amount and estimated gas.  The gas estimate is only a rough estimate and
     * may not match a swap's gas.
     * @param pool The MaverickV2Pool to swap on.
     * @param amount The input amount.
     * @param tokenAIn Indicates if token A is the input token.
     * @param exactOutput Indicates if the amount is the output amount (true)
     * or input amount (false). If the tickLimit is reached, the full value of
     * the exactOutput may not be returned because the pool will stop swapping
     * before the whole order is filled.
     * @param tickLimit The tick limit for the swap. Once the swap lands in
     * this tick, it will stop and return the output amount swapped up to that
     * tick.
     */
    function calculateSwap(
        address pool,
        uint128 amount,
        bool tokenAIn,
        bool exactOutput,
        int32 tickLimit
    ) external returns (uint256 amountIn, uint256 amountOut, uint256 gasEstimate);
  
  }
  
  
  interface IMaverickV2Factory {
      error FactoryInvalidProtocolFeeRatio(uint8 protocolFeeRatioD3);
      error FactoryInvalidLendingFeeRate(uint256 protocolLendingFeeRateD18);
      error FactoryProtocolFeeOnRenounce(uint8 protocolFeeRatioD3);
      error FactorAlreadyInitialized();
      error FactorNotInitialized();
      error FactoryInvalidTokenOrder(IERC20 _tokenA, IERC20 _tokenB);
      error FactoryInvalidFee();
      error FactoryInvalidKinds(uint8 kinds);
      error FactoryInvalidTickSpacing(uint256 tickSpacing);
      error FactoryInvalidLookback(uint256 lookback);
      error FactoryInvalidTokenDecimals(uint8 decimalsA, uint8 decimalsB);
      error FactoryPoolAlreadyExists(
          uint256 feeAIn,
          uint256 feeBIn,
          uint256 tickSpacing,
          uint256 lookback,
          IERC20 tokenA,
          IERC20 tokenB,
          uint8 kinds,
          address accessor
      );
      error FactoryAccessorMustBeNonZero();
  
      event PoolCreated(
          IMaverickV2Pool poolAddress,
          uint8 protocolFeeRatio,
          uint256 feeAIn,
          uint256 feeBIn,
          uint256 tickSpacing,
          uint256 lookback,
          int32 activeTick,
          IERC20 tokenA,
          IERC20 tokenB,
          uint8 kinds,
          address accessor
      );
      event SetFactoryProtocolFeeRatio(uint8 protocolFeeRatioD3);
      event SetFactoryProtocolLendingFeeRate(uint256 lendingFeeRateD18);
      event SetFactoryProtocolFeeReceiver(address receiver);
  
      struct DeployParameters {
          uint64 feeAIn;
          uint64 feeBIn;
          uint32 lookback;
          int32 activeTick;
          uint64 tokenAScale;
          uint64 tokenBScale;
          // slot
          IERC20 tokenA;
          // slot
          IERC20 tokenB;
          // slot
          uint16 tickSpacing;
          uint8 options;
          address accessor;
      }
  
      /**
       * @notice Called by deployer library to initialize a pool.
       */
      function deployParameters()
          external
          view
          returns (
              uint64 feeAIn,
              uint64 feeBIn,
              uint32 lookback,
              int32 activeTick,
              uint64 tokenAScale,
              uint64 tokenBScale,
              // slot
              IERC20 tokenA,
              // slot
              IERC20 tokenB,
              // slot
              uint16 tickSpacing,
              uint8 options,
              address accessor
          );
  
      /**
       * @notice Create a new MaverickV2Pool with symmetric swap fees.
       * @param fee Fraction of the pool swap amount that is retained as an LP in
       * D18 scale.
       * @param tickSpacing Tick spacing of pool where 1.0001^tickSpacing is the
       * bin width.
       * @param lookback Pool lookback in seconds.
       * @param tokenA Address of tokenA.
       * @param tokenB Address of tokenB.
       * @param activeTick Tick position that contains the active bins.
       * @param kinds 1-15 number to represent the active kinds
       * 0b0001 = static;
       * 0b0010 = right;
       * 0b0100 = left;
       * 0b1000 = both.
       * E.g. a pool with all 4 modes will have kinds = b1111 = 15
       */
      function create(
          uint64 fee,
          uint16 tickSpacing,
          uint32 lookback,
          IERC20 tokenA,
          IERC20 tokenB,
          int32 activeTick,
          uint8 kinds
      ) external returns (IMaverickV2Pool);
  
      /**
       * @notice Create a new MaverickV2Pool.
       * @param feeAIn Fraction of the pool swap amount for tokenA-input swaps
       * that is retained as an LP in D18 scale.
       * @param feeBIn Fraction of the pool swap amount for tokenB-input swaps
       * that is retained as an LP in D18 scale.
       * @param tickSpacing Tick spacing of pool where 1.0001^tickSpacing is the
       * bin width.
       * @param lookback Pool lookback in seconds.
       * @param tokenA Address of tokenA.
       * @param tokenB Address of tokenB.
       * @param activeTick Tick position that contains the active bins.
       * @param kinds 1-15 number to represent the active kinds
       * 0b0001 = static;
       * 0b0010 = right;
       * 0b0100 = left;
       * 0b1000 = both.
       * e.g. a pool with all 4 modes will have kinds = b1111 = 15
       */
      function create(
          uint64 feeAIn,
          uint64 feeBIn,
          uint16 tickSpacing,
          uint32 lookback,
          IERC20 tokenA,
          IERC20 tokenB,
          int32 activeTick,
          uint8 kinds
      ) external returns (IMaverickV2Pool);
  
      /**
       * @notice Create a new MaverickV2PoolPermissioned with symmetric swap fees
       * with all functions permissioned.  Set fee to zero to make the pool fee settable by the accessor.
       * @param fee Fraction of the pool swap amount that is retained as an LP in
       * D18 scale.
       * @param tickSpacing Tick spacing of pool where 1.0001^tickSpacing is the
       * bin width.
       * @param lookback Pool lookback in seconds.
       * @param tokenA Address of tokenA.
       * @param tokenB Address of tokenB.
       * @param activeTick Tick position that contains the active bins.
       * @param kinds 1-15 number to represent the active kinds
       * 0b0001 = static;
       * 0b0010 = right;
       * 0b0100 = left;
       * 0b1000 = both.
       * E.g. a pool with all 4 modes will have kinds = b1111 = 15
       * @param accessor Only address that can access the pool's public write functions.
       */
      function createPermissioned(
          uint64 fee,
          uint16 tickSpacing,
          uint32 lookback,
          IERC20 tokenA,
          IERC20 tokenB,
          int32 activeTick,
          uint8 kinds,
          address accessor
      ) external returns (IMaverickV2Pool);
  
      /**
       * @notice Create a new MaverickV2PoolPermissioned with all functions
       * permissioned. Set fees to zero to make the pool fee settable by the
       * accessor.
       * @param feeAIn Fraction of the pool swap amount for tokenA-input swaps
       * that is retained as an LP in D18 scale.
       * @param feeBIn Fraction of the pool swap amount for tokenB-input swaps
       * that is retained as an LP in D18 scale.
       * @param tickSpacing Tick spacing of pool where 1.0001^tickSpacing is the
       * bin width.
       * @param lookback Pool lookback in seconds.
       * @param tokenA Address of tokenA.
       * @param tokenB Address of tokenB.
       * @param activeTick Tick position that contains the active bins.
       * @param kinds 1-15 number to represent the active kinds
       * 0b0001 = static;
       * 0b0010 = right;
       * 0b0100 = left;
       * 0b1000 = both.
       * E.g. a pool with all 4 modes will have kinds = b1111 = 15
       * @param accessor only address that can access the pool's public write functions.
       */
      function createPermissioned(
          uint64 feeAIn,
          uint64 feeBIn,
          uint16 tickSpacing,
          uint32 lookback,
          IERC20 tokenA,
          IERC20 tokenB,
          int32 activeTick,
          uint8 kinds,
          address accessor
      ) external returns (IMaverickV2Pool);
  
      /**
       * @notice Create a new MaverickV2PoolPermissioned with the option to make
       * a subset of function permissionless. Set fee to zero to make the pool
       * fee settable by the accessor.
       * @param feeAIn Fraction of the pool swap amount for tokenA-input swaps
       * that is retained as an LP in D18 scale.
       * @param feeBIn Fraction of the pool swap amount for tokenB-input swaps
       * that is retained as an LP in D18 scale.
       * @param tickSpacing Tick spacing of pool where 1.0001^tickSpacing is the
       * bin width.
       * @param lookback Pool lookback in seconds.
       * @param tokenA Address of tokenA.
       * @param tokenB Address of tokenB.
       * @param activeTick Tick position that contains the active bins.
       * @param kinds 1-15 number to represent the active kinds
       * 0b0001 = static;
       * 0b0010 = right;
       * 0b0100 = left;
       * 0b1000 = both.
       * E.g. a pool with all 4 modes will have kinds = b1111 = 15
       * @param accessor only address that can access the pool's public permissioned write functions.
       * @param  permissionedLiquidity If true, then only accessor can call
       * pool's liquidity management functions: `flashLoan`,
       * `migrateBinsUpstack`, `addLiquidity`, `removeLiquidity`.
       * @param  permissionedSwap If true, then only accessor can call
       * pool's swap function.
       */
      function createPermissioned(
          uint64 feeAIn,
          uint64 feeBIn,
          uint16 tickSpacing,
          uint32 lookback,
          IERC20 tokenA,
          IERC20 tokenB,
          int32 activeTick,
          uint8 kinds,
          address accessor,
          bool permissionedLiquidity,
          bool permissionedSwap
      ) external returns (IMaverickV2Pool pool);
  
      /**
       * @notice Update the protocol fee ratio for a pool. Can be called
       * permissionlessly allowing any user to sync the pool protocol fee value
       * with the factory protocol fee value.
       * @param pool The pool for which to update.
       */
      function updateProtocolFeeRatioForPool(IMaverickV2Pool pool) external;
  
      /**
       * @notice Update the protocol lending fee rate for a pool. Can be called
       * permissionlessly allowing any user to sync the pool protocol lending fee
       * rate value with the factory value.
       * @param pool The pool for which to update.
       */
      function updateProtocolLendingFeeRateForPool(IMaverickV2Pool pool) external;
  
      /**
       * @notice Claim protocol fee for a pool and transfer it to the protocolFeeReceiver.
       * @param pool The pool from which to claim the protocol fee.
       * @param isTokenA A boolean indicating whether tokenA (true) or tokenB
       * (false) is being collected.
       */
      function claimProtocolFeeForPool(IMaverickV2Pool pool, bool isTokenA) external;
  
      /**
       * @notice Claim protocol fee for a pool and transfer it to the protocolFeeReceiver.
       * @param pool The pool from which to claim the protocol fee.
       */
      function claimProtocolFeeForPool(IMaverickV2Pool pool) external;
  
      /**
       * @notice Bool indicating whether the pool was deployed from this factory.
       */
      function isFactoryPool(IMaverickV2Pool pool) external view returns (bool);
  
      /**
       * @notice Address that receives the protocol fee when users call
       * `claimProtocolFeeForPool`.
       */
      function protocolFeeReceiver() external view returns (address);
  
      /**
       * @notice Lookup a pool for given parameters.
       *
       * @dev  options bit map of kinds and function permissions
       * 0b000001 = static;
       * 0b000010 = right;
       * 0b000100 = left;
       * 0b001000 = both;
       * 0b010000 = liquidity functions are permissioned
       * 0b100000 = swap function is permissioned
       */
      function lookupPermissioned(
          uint256 feeAIn,
          uint256 feeBIn,
          uint256 tickSpacing,
          uint256 lookback,
          IERC20 tokenA,
          IERC20 tokenB,
          uint8 options,
          address accessor
      ) external view returns (IMaverickV2Pool);
  
      /**
       * @notice Lookup a pool for given parameters.
       */
      function lookupPermissioned(
          IERC20 _tokenA,
          IERC20 _tokenB,
          address accessor,
          uint256 startIndex,
          uint256 endIndex
      ) external view returns (IMaverickV2Pool[] memory pools);
  
      /**
       * @notice Lookup a pool for given parameters.
       */
      function lookupPermissioned(
          uint256 startIndex,
          uint256 endIndex
      ) external view returns (IMaverickV2Pool[] memory pools);
  
      /**
       * @notice Lookup a pool for given parameters.
       */
      function lookup(
          uint256 feeAIn,
          uint256 feeBIn,
          uint256 tickSpacing,
          uint256 lookback,
          IERC20 tokenA,
          IERC20 tokenB,
          uint8 kinds
      ) external view returns (IMaverickV2Pool);
  
      /**
       * @notice Lookup a pool for given parameters.
       */
      function lookup(
          IERC20 _tokenA,
          IERC20 _tokenB,
          uint256 startIndex,
          uint256 endIndex
      ) external view returns (IMaverickV2Pool[] memory pools);
  
      /**
       * @notice Lookup a pool for given parameters.
       */
      function lookup(uint256 startIndex, uint256 endIndex) external view returns (IMaverickV2Pool[] memory pools);
  
      /**
       * @notice Count of permissionless pools.
       */
      function poolCount() external view returns (uint256 _poolCount);
  
      /**
       * @notice Count of permissioned pools.
       */
      function poolPermissionedCount() external view returns (uint256 _poolCount);
  
      /**
       * @notice Count of pools for a given accessor and token pair.  For
       * permissionless pools, pass `accessor = address(0)`.
       */
      function poolByTokenCount(
          IERC20 _tokenA,
          IERC20 _tokenB,
          address accessor
      ) external view returns (uint256 _poolCount);
  
      /**
       * @notice Get the current factory owner.
       */
      function owner() external view returns (address);
  
      /**
       * @notice Proportion of protocol fee to collect on each swap.  Value is in
       * 3-decimal format with a maximum value of 0.25e3.
       */
      function protocolFeeRatioD3() external view returns (uint8);
  
      /**
       * @notice Fee rate charged by the protocol for flashloans.  Value is in
       * 18-decimal format with a maximum value of 0.02e18.
       */
      function protocolLendingFeeRateD18() external view returns (uint256);
  }

  
  
  
interface IRouterErrors {
    error RouterZeroSwap();
    error RouterNotFactoryPool();
    error RouterTooLittleReceived(uint256 amountOutMinimum, uint256 amountOut);
    error RouterTooMuchRequested(uint256 amountInMaximum, uint256 amountIn);
}

  interface IMaverickV2Router is IRouterErrors {
    /**
     * @notice Perform an exact input single swap with compressed input values.
     */
    function exactInputSinglePackedArgs(bytes memory argsPacked) external payable returns (uint256 amountOut);

    /**
     * @notice Perform an exact input single swap without tick limit check.
     * @param recipient The address of the recipient.
     * @param pool The Maverick V2 pool to swap with.
     * @param tokenAIn True is tokenA is the input token.  False is tokenB is
     * the input token.
     * @param amountIn The amount of input tokens.
     * @param amountOutMinimum The minimum amount of output tokens expected.
     */
    function exactInputSingle(
        address recipient,
        address pool,
        bool tokenAIn,
        uint256 amountIn,
        uint256 amountOutMinimum
    ) external payable returns (uint256 amountOut);

    /**
     * @notice Perform an exact input multi-hop swap.
     * @param recipient The address of the recipient.
     * @param path The path of tokens to swap.
     * @param amountIn The amount of input tokens.
     * @param amountOutMinimum The minimum amount of output tokens expected.
     */
    function exactInputMultiHop(
        address recipient,
        bytes memory path,
        uint256 amountIn,
        uint256 amountOutMinimum
    ) external payable returns (uint256 amountOut);
}