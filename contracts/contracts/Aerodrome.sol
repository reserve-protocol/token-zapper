// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

interface IAerodromeRouter {
    struct Route {
        address from;
        address to;
        bool stable;
        address factory;
    }

    error ETHTransferFailed();
    error Expired();
    error InsufficientAmount();
    error InsufficientAmountA();
    error InsufficientAmountB();
    error InsufficientAmountADesired();
    error InsufficientAmountBDesired();
    error InsufficientAmountAOptimal();
    error InsufficientLiquidity();
    error InsufficientOutputAmount();
    error InvalidAmountInForETHDeposit();
    error InvalidTokenInForETHDeposit();
    error InvalidPath();
    error InvalidRouteA();
    error InvalidRouteB();
    error OnlyWETH();
    error PoolDoesNotExist();
    error PoolFactoryDoesNotExist();
    error SameAddresses();
    error ZeroAddress();

    /// @notice Address of FactoryRegistry.sol
    function factoryRegistry() external view returns (address);

    /// @notice Address of Protocol PoolFactory.sol
    function defaultFactory() external view returns (address);

    /// @dev Struct containing information necessary to zap in and out of pools
    /// @param tokenA           .
    /// @param tokenB           .
    /// @param stable           Stable or volatile pool
    /// @param factory          factory of pool
    /// @param amountOutMinA    Minimum amount expected from swap leg of zap via routesA
    /// @param amountOutMinB    Minimum amount expected from swap leg of zap via routesB
    /// @param amountAMin       Minimum amount of tokenA expected from liquidity leg of zap
    /// @param amountBMin       Minimum amount of tokenB expected from liquidity leg of zap
    struct Zap {
        address tokenA;
        address tokenB;
        bool stable;
        address factory;
        uint256 amountOutMinA;
        uint256 amountOutMinB;
        uint256 amountAMin;
        uint256 amountBMin;
    }

    /// @notice Sort two tokens by which address value is less than the other
    /// @param tokenA   Address of token to sort
    /// @param tokenB   Address of token to sort
    /// @return token0  Lower address value between tokenA and tokenB
    /// @return token1  Higher address value between tokenA and tokenB
    function sortTokens(address tokenA, address tokenB) external pure returns (address token0, address token1);

    /// @notice Calculate the address of a pool by its' factory.
    ///         Used by all Router functions containing a `Route[]` or `_factory` argument.
    ///         Reverts if _factory is not approved by the FactoryRegistry
    /// @dev Returns a randomly generated address for a nonexistent pool
    /// @param tokenA   Address of token to query
    /// @param tokenB   Address of token to query
    /// @param stable   True if pool is stable, false if volatile
    /// @param _factory Address of factory which created the pool
    function poolFor(
        address tokenA,
        address tokenB,
        bool stable,
        address _factory
    ) external view returns (address pool);

    /// @notice Fetch and sort the reserves for a pool
    /// @param tokenA       .
    /// @param tokenB       .
    /// @param stable       True if pool is stable, false if volatile
    /// @param _factory     Address of PoolFactory for tokenA and tokenB
    /// @return reserveA    Amount of reserves of the sorted token A
    /// @return reserveB    Amount of reserves of the sorted token B
    function getReserves(
        address tokenA,
        address tokenB,
        bool stable,
        address _factory
    ) external view returns (uint256 reserveA, uint256 reserveB);

    /// @notice Perform chained getAmountOut calculations on any number of pools
    function getAmountsOut(uint256 amountIn, Route[] memory routes) external view returns (uint256[] memory amounts);

    // **** ADD LIQUIDITY ****

    /// @notice Quote the amount deposited into a Pool
    /// @param tokenA           .
    /// @param tokenB           .
    /// @param stable           True if pool is stable, false if volatile
    /// @param _factory         Address of PoolFactory for tokenA and tokenB
    /// @param amountADesired   Amount of tokenA desired to deposit
    /// @param amountBDesired   Amount of tokenB desired to deposit
    /// @return amountA         Amount of tokenA to actually deposit
    /// @return amountB         Amount of tokenB to actually deposit
    /// @return liquidity       Amount of liquidity token returned from deposit
    function quoteAddLiquidity(
        address tokenA,
        address tokenB,
        bool stable,
        address _factory,
        uint256 amountADesired,
        uint256 amountBDesired
    ) external view returns (uint256 amountA, uint256 amountB, uint256 liquidity);

    /// @notice Quote the amount of liquidity removed from a Pool
    /// @param tokenA       .
    /// @param tokenB       .
    /// @param stable       True if pool is stable, false if volatile
    /// @param _factory     Address of PoolFactory for tokenA and tokenB
    /// @param liquidity    Amount of liquidity to remove
    /// @return amountA     Amount of tokenA received
    /// @return amountB     Amount of tokenB received
    function quoteRemoveLiquidity(
        address tokenA,
        address tokenB,
        bool stable,
        address _factory,
        uint256 liquidity
    ) external view returns (uint256 amountA, uint256 amountB);

    /// @notice Add liquidity of two tokens to a Pool
    /// @param tokenA           .
    /// @param tokenB           .
    /// @param stable           True if pool is stable, false if volatile
    /// @param amountADesired   Amount of tokenA desired to deposit
    /// @param amountBDesired   Amount of tokenB desired to deposit
    /// @param amountAMin       Minimum amount of tokenA to deposit
    /// @param amountBMin       Minimum amount of tokenB to deposit
    /// @param to               Recipient of liquidity token
    /// @param deadline         Deadline to receive liquidity
    /// @return amountA         Amount of tokenA to actually deposit
    /// @return amountB         Amount of tokenB to actually deposit
    /// @return liquidity       Amount of liquidity token returned from deposit
    function addLiquidity(
        address tokenA,
        address tokenB,
        bool stable,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB, uint256 liquidity);

    /// @notice Add liquidity of a token and WETH (transferred as ETH) to a Pool
    /// @param token                .
    /// @param stable               True if pool is stable, false if volatile
    /// @param amountTokenDesired   Amount of token desired to deposit
    /// @param amountTokenMin       Minimum amount of token to deposit
    /// @param amountETHMin         Minimum amount of ETH to deposit
    /// @param to                   Recipient of liquidity token
    /// @param deadline             Deadline to add liquidity
    /// @return amountToken         Amount of token to actually deposit
    /// @return amountETH           Amount of tokenETH to actually deposit
    /// @return liquidity           Amount of liquidity token returned from deposit
    function addLiquidityETH(
        address token,
        bool stable,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external payable returns (uint256 amountToken, uint256 amountETH, uint256 liquidity);

    // **** REMOVE LIQUIDITY ****

    /// @notice Remove liquidity of two tokens from a Pool
    /// @param tokenA       .
    /// @param tokenB       .
    /// @param stable       True if pool is stable, false if volatile
    /// @param liquidity    Amount of liquidity to remove
    /// @param amountAMin   Minimum amount of tokenA to receive
    /// @param amountBMin   Minimum amount of tokenB to receive
    /// @param to           Recipient of tokens received
    /// @param deadline     Deadline to remove liquidity
    /// @return amountA     Amount of tokenA received
    /// @return amountB     Amount of tokenB received
    function removeLiquidity(
        address tokenA,
        address tokenB,
        bool stable,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB);

    /// @notice Remove liquidity of a token and WETH (returned as ETH) from a Pool
    /// @param token            .
    /// @param stable           True if pool is stable, false if volatile
    /// @param liquidity        Amount of liquidity to remove
    /// @param amountTokenMin   Minimum amount of token to receive
    /// @param amountETHMin     Minimum amount of ETH to receive
    /// @param to               Recipient of liquidity token
    /// @param deadline         Deadline to receive liquidity
    /// @return amountToken     Amount of token received
    /// @return amountETH       Amount of ETH received
    function removeLiquidityETH(
        address token,
        bool stable,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountToken, uint256 amountETH);

    /// @notice Remove liquidity of a fee-on-transfer token and WETH (returned as ETH) from a Pool
    /// @param token            .
    /// @param stable           True if pool is stable, false if volatile
    /// @param liquidity        Amount of liquidity to remove
    /// @param amountTokenMin   Minimum amount of token to receive
    /// @param amountETHMin     Minimum amount of ETH to receive
    /// @param to               Recipient of liquidity token
    /// @param deadline         Deadline to receive liquidity
    /// @return amountETH       Amount of ETH received
    function removeLiquidityETHSupportingFeeOnTransferTokens(
        address token,
        bool stable,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountETH);

    // **** SWAP ****

    /// @notice Swap one token for another
    /// @param amountIn     Amount of token in
    /// @param amountOutMin Minimum amount of desired token received
    /// @param routes       Array of trade routes used in the swap
    /// @param to           Recipient of the tokens received
    /// @param deadline     Deadline to receive tokens
    /// @return amounts     Array of amounts returned per route
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        Route[] calldata routes,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    /// @notice Swap ETH for a token
    /// @param amountOutMin Minimum amount of desired token received
    /// @param routes       Array of trade routes used in the swap
    /// @param to           Recipient of the tokens received
    /// @param deadline     Deadline to receive tokens
    /// @return amounts     Array of amounts returned per route
    function swapExactETHForTokens(
        uint256 amountOutMin,
        Route[] calldata routes,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts);

    /// @notice Swap a token for WETH (returned as ETH)
    /// @param amountIn     Amount of token in
    /// @param amountOutMin Minimum amount of desired ETH
    /// @param routes       Array of trade routes used in the swap
    /// @param to           Recipient of the tokens received
    /// @param deadline     Deadline to receive tokens
    /// @return amounts     Array of amounts returned per route
    function swapExactTokensForETH(
        uint256 amountIn,
        uint256 amountOutMin,
        Route[] calldata routes,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    /// @notice Swap one token for another without slippage protection
    /// @return amounts     Array of amounts to swap  per route
    /// @param routes       Array of trade routes used in the swap
    /// @param to           Recipient of the tokens received
    /// @param deadline     Deadline to receive tokens
    function UNSAFE_swapExactTokensForTokens(
        uint256[] memory amounts,
        Route[] calldata routes,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory);

    // **** SWAP (supporting fee-on-transfer tokens) ****

    /// @notice Swap one token for another supporting fee-on-transfer tokens
    /// @param amountIn     Amount of token in
    /// @param amountOutMin Minimum amount of desired token received
    /// @param routes       Array of trade routes used in the swap
    /// @param to           Recipient of the tokens received
    /// @param deadline     Deadline to receive tokens
    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        Route[] calldata routes,
        address to,
        uint256 deadline
    ) external;

    /// @notice Swap ETH for a token supporting fee-on-transfer tokens
    /// @param amountOutMin Minimum amount of desired token received
    /// @param routes       Array of trade routes used in the swap
    /// @param to           Recipient of the tokens received
    /// @param deadline     Deadline to receive tokens
    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint256 amountOutMin,
        Route[] calldata routes,
        address to,
        uint256 deadline
    ) external payable;

    /// @notice Swap a token for WETH (returned as ETH) supporting fee-on-transfer tokens
    /// @param amountIn     Amount of token in
    /// @param amountOutMin Minimum amount of desired ETH
    /// @param routes       Array of trade routes used in the swap
    /// @param to           Recipient of the tokens received
    /// @param deadline     Deadline to receive tokens
    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        Route[] calldata routes,
        address to,
        uint256 deadline
    ) external;

    /// @notice Zap a token A into a pool (B, C). (A can be equal to B or C).
    ///         Supports standard ERC20 tokens only (i.e. not fee-on-transfer tokens etc).
    ///         Slippage is required for the initial swap.
    ///         Additional slippage may be required when adding liquidity as the
    ///         price of the token may have changed.
    /// @param tokenIn      Token you are zapping in from (i.e. input token).
    /// @param amountInA    Amount of input token you wish to send down routesA
    /// @param amountInB    Amount of input token you wish to send down routesB
    /// @param zapInPool    Contains zap struct information. See Zap struct.
    /// @param routesA      Route used to convert input token to tokenA
    /// @param routesB      Route used to convert input token to tokenB
    /// @param to           Address you wish to mint liquidity to.
    /// @param stake        Auto-stake liquidity in corresponding gauge.
    /// @return liquidity   Amount of LP tokens created from zapping in.
    function zapIn(
        address tokenIn,
        uint256 amountInA,
        uint256 amountInB,
        Zap calldata zapInPool,
        Route[] calldata routesA,
        Route[] calldata routesB,
        address to,
        bool stake
    ) external payable returns (uint256 liquidity);

    /// @notice Zap out a pool (B, C) into A.
    ///         Supports standard ERC20 tokens only (i.e. not fee-on-transfer tokens etc).
    ///         Slippage is required for the removal of liquidity.
    ///         Additional slippage may be required on the swap as the
    ///         price of the token may have changed.
    /// @param tokenOut     Token you are zapping out to (i.e. output token).
    /// @param liquidity    Amount of liquidity you wish to remove.
    /// @param zapOutPool   Contains zap struct information. See Zap struct.
    /// @param routesA      Route used to convert tokenA into output token.
    /// @param routesB      Route used to convert tokenB into output token.
    function zapOut(
        address tokenOut,
        uint256 liquidity,
        Zap calldata zapOutPool,
        Route[] calldata routesA,
        Route[] calldata routesB
    ) external;

    /// @notice Used to generate params required for zapping in.
    ///         Zap in => remove liquidity then swap.
    ///         Apply slippage to expected swap values to account for changes in reserves in between.
    /// @dev Output token refers to the token you want to zap in from.
    /// @param tokenA           .
    /// @param tokenB           .
    /// @param stable           .
    /// @param _factory         .
    /// @param amountInA        Amount of input token you wish to send down routesA
    /// @param amountInB        Amount of input token you wish to send down routesB
    /// @param routesA          Route used to convert input token to tokenA
    /// @param routesB          Route used to convert input token to tokenB
    /// @return amountOutMinA   Minimum output expected from swapping input token to tokenA.
    /// @return amountOutMinB   Minimum output expected from swapping input token to tokenB.
    /// @return amountAMin      Minimum amount of tokenA expected from depositing liquidity.
    /// @return amountBMin      Minimum amount of tokenB expected from depositing liquidity.
    function generateZapInParams(
        address tokenA,
        address tokenB,
        bool stable,
        address _factory,
        uint256 amountInA,
        uint256 amountInB,
        Route[] calldata routesA,
        Route[] calldata routesB
    ) external view returns (uint256 amountOutMinA, uint256 amountOutMinB, uint256 amountAMin, uint256 amountBMin);

    /// @notice Used to generate params required for zapping out.
    ///         Zap out => swap then add liquidity.
    ///         Apply slippage to expected liquidity values to account for changes in reserves in between.
    /// @dev Output token refers to the token you want to zap out of.
    /// @param tokenA           .
    /// @param tokenB           .
    /// @param stable           .
    /// @param _factory         .
    /// @param liquidity        Amount of liquidity being zapped out of into a given output token.
    /// @param routesA          Route used to convert tokenA into output token.
    /// @param routesB          Route used to convert tokenB into output token.
    /// @return amountOutMinA   Minimum output expected from swapping tokenA into output token.
    /// @return amountOutMinB   Minimum output expected from swapping tokenB into output token.
    /// @return amountAMin      Minimum amount of tokenA expected from withdrawing liquidity.
    /// @return amountBMin      Minimum amount of tokenB expected from withdrawing liquidity.
    function generateZapOutParams(
        address tokenA,
        address tokenB,
        bool stable,
        address _factory,
        uint256 liquidity,
        Route[] calldata routesA,
        Route[] calldata routesB
    ) external view returns (uint256 amountOutMinA, uint256 amountOutMinB, uint256 amountAMin, uint256 amountBMin);

    /// @notice Used by zapper to determine appropriate ratio of A to B to deposit liquidity. Assumes stable pool.
    /// @dev Returns stable liquidity ratio of B to (A + B).
    ///      E.g. if ratio is 0.4, it means there is more of A than there is of B.
    ///      Therefore you should deposit more of token A than B.
    /// @param tokenA   tokenA of stable pool you are zapping into.
    /// @param tokenB   tokenB of stable pool you are zapping into.
    /// @param factory  Factory that created stable pool.
    /// @return ratio   Ratio of token0 to token1 required to deposit into zap.
    function quoteStableLiquidityRatio(
        address tokenA,
        address tokenB,
        address factory
    ) external view returns (uint256 ratio);
}

interface IMixedRouteQuoterV1 {
    /// @notice Returns the amount out received for a given exact input swap without executing the swap
    /// @param path The path of the swap, i.e. each token pair and the pool fee
    /// @param amountIn The amount of the first token to swap
    /// @return amountOut The amount of the last token that would be received
    /// @return v3SqrtPriceX96AfterList List of the sqrt price after the swap for each v3 pool in the path, 0 for v2 pools
    /// @return v3InitializedTicksCrossedList List of the initialized ticks that the swap crossed for each v3 pool in the path, 0 for v2 pools
    /// @return v3SwapGasEstimate The estimate of the gas that the v3 swaps in the path consume
    function quoteExactInput(bytes memory path, uint256 amountIn)
        external
        returns (
            uint256 amountOut,
            uint160[] memory v3SqrtPriceX96AfterList,
            uint32[] memory v3InitializedTicksCrossedList,
            uint256 v3SwapGasEstimate
        );

    struct QuoteExactInputSingleV3Params {
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        int24 tickSpacing;
        uint160 sqrtPriceLimitX96;
    }

    struct QuoteExactInputSingleV2Params {
        address tokenIn;
        address tokenOut;
        bool stable;
        uint256 amountIn;
    }

    /// @notice Returns the amount out received for a given exact input but for a swap of a single pool
    /// @param params The params for the quote, encoded as `QuoteExactInputSingleParams`
    /// tokenIn The token being swapped in
    /// tokenOut The token being swapped out
    /// tickSpacing The tickSpacing of the token pool to consider for the pair
    /// amountIn The desired input amount
    /// sqrtPriceLimitX96 The price limit of the pool that cannot be exceeded by the swap
    /// @return amountOut The amount of `tokenOut` that would be received
    /// @return sqrtPriceX96After The sqrt price of the pool after the swap
    /// @return initializedTicksCrossed The number of initialized ticks that the swap crossed
    /// @return gasEstimate The estimate of the gas that the swap consumes
    function quoteExactInputSingleV3(QuoteExactInputSingleV3Params memory params)
        external
        returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate);

    /// @notice Returns the amount out received for a given exact input but for a swap of a single V2 pool
    /// @param params The params for the quote, encoded as `QuoteExactInputSingleV2Params`
    /// tokenIn The token being swapped in
    /// tokenOut The token being swapped out
    /// stable The boolean representing volatile (false) or stable (true)
    /// amountIn The desired input amount
    /// @return amountOut The amount of `tokenOut` that would be received
    function quoteExactInputSingleV2(QuoteExactInputSingleV2Params memory params)
        external
        returns (uint256 amountOut);

    /// @dev ExactOutput swaps are not supported by this new Quoter which is specialized for supporting routes
    ///      crossing both V2 liquidity pairs and V3 pools.
    /// @deprecated quoteExactOutputSingle and exactOutput. Use QuoterV2 instead.
}

interface IAerodromeFactory {
    event SetFeeManager(address feeManager);
    event SetPauser(address pauser);
    event SetPauseState(bool state);
    event SetVoter(address voter);
    event PoolCreated(address indexed token0, address indexed token1, bool indexed stable, address pool, uint256);
    event SetCustomFee(address indexed pool, uint256 fee);

    error FeeInvalid();
    error FeeTooHigh();
    error InvalidPool();
    error NotFeeManager();
    error NotPauser();
    error NotVoter();
    error PoolAlreadyExists();
    error SameAddress();
    error ZeroFee();
    error ZeroAddress();

    /// @notice returns the number of pools created from this factory
    function allPoolsLength() external view returns (uint256);

    /// @notice Is a valid pool created by this factory.
    /// @param .
    function isPool(address pool) external view returns (bool);

    /// @notice Support for v3-style pools which wraps around getPool(tokenA,tokenB,stable)
    /// @dev fee is converted to stable boolean.
    /// @param tokenA .
    /// @param tokenB .
    /// @param fee  1 if stable, 0 if volatile, else returns address(0)
    function getPool(address tokenA, address tokenB, int24 fee) external view returns (address);

    /// @dev Only called once to set to Voter.sol - Voter does not have a function
    ///      to call this contract method, so once set it's immutable.
    ///      This also follows convention of setVoterAndDistributor() in VotingEscrow.sol
    /// @param _voter .
    function setVoter(address _voter) external;

    function setPauser(address _pauser) external;

    function setPauseState(bool _state) external;

    function setFeeManager(address _feeManager) external;

    /// @notice Set default fee for stable and volatile pools.
    /// @dev Throws if higher than maximum fee.
    ///      Throws if fee is zero.
    /// @param _stable Stable or volatile pool.
    /// @param _fee .
    function setFee(bool _stable, uint256 _fee) external;

    /// @notice Set overriding fee for a pool from the default
    /// @dev A custom fee of zero means the default fee will be used.
    function setCustomFee(address _pool, uint256 _fee) external;

    /// @notice Returns fee for a pool, as custom fees are possible.
    function getFee(address _pool, bool _stable) external view returns (uint256);

    /// @notice Create a pool given two tokens and if they're stable/volatile
    /// @dev token order does not matter
    /// @param tokenA .
    /// @param tokenB .
    /// @param stable .
    function createPool(address tokenA, address tokenB, bool stable) external returns (address pool);

    /// @notice Support for v3-style pools which wraps around createPool(tokena,tokenB,stable)
    /// @dev fee is converted to stable boolean
    /// @dev token order does not matter
    /// @param tokenA .
    /// @param tokenB .
    /// @param fee 1 if stable, 0 if volatile, else revert
    function createPool(address tokenA, address tokenB, uint24 fee) external returns (address pool);

    function isPaused() external view returns (bool);

    function voter() external view returns (address);

    function implementation() external view returns (address);
}

struct SwapLp {
  address lp;
  int24 poolType;
  address token0;
  address token1;
  address factory;
  uint256 poolFee;
}

interface IAerodromeSugar {
  function forSwaps(uint256 limit, uint256 offset) external view returns (SwapLp[]memory);
}



interface ISwapRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        int24 tickSpacing;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    /// @notice Swaps `amountIn` of one token for as much as possible of another token
    /// @param params The parameters necessary for the swap, encoded as `ExactInputSingleParams` in calldata
    /// @return amountOut The amount of the received token
    function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut);

    struct ExactInputParams {
        bytes path;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
    }

    /// @notice Swaps `amountIn` of one token for as much as possible of another along the specified path
    /// @param params The parameters necessary for the multi-hop swap, encoded as `ExactInputParams` in calldata
    /// @return amountOut The amount of the received token
    function exactInput(ExactInputParams calldata params) external payable returns (uint256 amountOut);
}
contract SlipstreamRouterCall {
    function exactInputSingle(
        uint256 amountIn,
        uint256 _expected,
        address router,
        bytes calldata encodedRouterCall
    ) external returns (uint256) {
        (ISwapRouter.ExactInputSingleParams memory decodedCall) = abi.decode(
            encodedRouterCall,
            (ISwapRouter.ExactInputSingleParams)
        );
        decodedCall.amountIn = amountIn;
        decodedCall.amountOutMinimum = _expected;
        return ISwapRouter(router).exactInputSingle(decodedCall);
    }

    function exactInput(
        uint256 amountIn,
        uint256 _expected,
        address router,
        address recipient,
        bytes memory path
    ) external returns (uint256) {
        ISwapRouter.ExactInputParams memory decodedCall = ISwapRouter.ExactInputParams({
            path: path,
            recipient: recipient,
            deadline: block.timestamp + 1000,
            amountIn: amountIn,
            amountOutMinimum: _expected
        });
        decodedCall.amountIn = amountIn;
        decodedCall.amountOutMinimum = _expected;
        return ISwapRouter(router).exactInput(decodedCall);
    }


    struct State {
        uint256 amountA;
        uint256 amountB;
        uint256 expectedA;
        uint256 expectedB;

        address tokenA;
        address tokenB;
        bool stable;
        address dest;
    }

    function addLiquidityV2(
        uint256 amountA,
        uint256 amountB,
        uint256 expectedA,
        uint256 expectedB,
        bytes memory encoding
    ) external returns (uint256 amountOut) {
        State memory state = State(amountA, amountB, expectedA, expectedB, address(0), address(0), false, address(0));

        (address tokenA, address tokenB, bool stable, address dest, address router) = abi.decode(
            encoding,
            (address, address, bool, address, address)
        );

        state.tokenA = tokenA;
        state.tokenB = tokenB;
        state.stable = stable;
        state.dest = dest;
        
        {
            (, , uint256 liquidity) = IAerodromeRouter(router).addLiquidity(
                state.tokenA,
                state.tokenB,
                state.stable,
                state.amountA,
                state.amountB,
                state.expectedA,
                state.expectedB,
                state.dest,
                block.timestamp + 1000
            );

            return liquidity;
        }
    }


    function exactInputSingleV2(
        uint256 amountIn,
        uint256 expected,
        IAerodromeRouter router,
        address recipient,
        bytes memory encoding
    ) external returns (uint256 amountOut) {
        (address tokenIn, address tokenOut, bool stable, address factory) = abi.decode(
            encoding,
            (address, address, bool, address)
        );
        IAerodromeRouter.Route[] memory routes = new IAerodromeRouter.Route[](1);

        routes[0] = IAerodromeRouter.Route({
            from: tokenIn,
            to: tokenOut,
            stable: stable,
            factory: factory
        });
        
        uint[] memory out = router.swapExactTokensForTokens(
            amountIn,
            expected,
            routes,
            recipient,
            block.timestamp + 1000
        );

        return out[out.length - 1];
    }
}