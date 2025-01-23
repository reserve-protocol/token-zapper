// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IVotes } from "@openzeppelin/contracts/governance/utils/IVotes.sol";

interface IFolio {
    // === Events ===

    event TradeApproved(
        uint256 indexed tradeId,
        address indexed from,
        address indexed to,
        uint256 startPrice,
        uint256 endPrice,
        uint256 sellLimitSpot,
        uint256 sellLimitLow,
        uint256 sellLimitHigh,
        uint256 buyLimitSpot,
        uint256 buyLimitLow,
        uint256 buyLimitHigh
    );
    event TradeOpened(
        uint256 indexed tradeId,
        uint256 startPrice,
        uint256 endPrice,
        uint256 sellLimit,
        uint256 buyLimit,
        uint256 start,
        uint256 end
    );
    event Bid(uint256 indexed tradeId, uint256 sellAmount, uint256 buyAmount);
    event TradeKilled(uint256 indexed tradeId);

    event BasketTokenAdded(address indexed token);
    event BasketTokenRemoved(address indexed token);
    event FolioFeeSet(uint256 newFee, uint256 feeAnnually);
    event MintingFeeSet(uint256 newFee);
    event FeeRecipientSet(address indexed recipient, uint96 portion);
    event TradeDelaySet(uint256 newTradeDelay);
    event AuctionLengthSet(uint256 newAuctionLength);
    event FolioKilled();

    // === Errors ===

    error Folio__FolioKilled();
    error Folio__Unauthorized();

    error Folio__EmptyAssets();
    error Folio__BasketModificationFailed();

    error Folio__FeeRecipientInvalidAddress();
    error Folio__FeeRecipientInvalidFeeShare();
    error Folio__BadFeeTotal();
    error Folio__FolioFeeTooHigh();
    error Folio__FolioFeeTooLow();
    error Folio__MintingFeeTooHigh();

    error Folio__InvalidAsset();
    error Folio__InvalidAssetAmount(address asset);

    error Folio__InvalidAuctionLength();
    error Folio__InvalidTradeId();
    error Folio__InvalidSellLimit();
    error Folio__InvalidBuyLimit();
    error Folio__TradeCannotBeOpened();
    error Folio__TradeCannotBeOpenedPermissionlesslyYet();
    error Folio__TradeNotOngoing();
    error Folio__TradeCollision();
    error Folio__InvalidPrices();
    error Folio__TradeTimeout();
    error Folio__SlippageExceeded();
    error Folio__InsufficientBalance();
    error Folio__InsufficientBid();
    error Folio__ExcessiveBid();
    error Folio__InvalidTradeTokens();
    error Folio__InvalidTradeDelay();
    error Folio__InvalidTradeTTL();
    error Folio__TooManyFeeRecipients();
    error Folio__InvalidArrayLengths();

    // === Structures ===

    struct FolioBasicDetails {
        string name;
        string symbol;
        address[] assets;
        uint256[] amounts; // {tok}
        uint256 initialShares; // {share}
    }

    struct FolioAdditionalDetails {
        uint256 tradeDelay; // {s}
        uint256 auctionLength; // {s}
        FeeRecipient[] feeRecipients;
        uint256 folioFee; // D18{1/s}
        uint256 mintingFee; // D18{1}
    }

    struct FeeRecipient {
        address recipient;
        uint96 portion; // D18{1}
    }

    struct Range {
        uint256 spot; // D27{buyTok/share}
        uint256 low; // D27{buyTok/share} inclusive
        uint256 high; // D27{buyTok/share} inclusive
    }

    /// Trade states:
    ///   - APPROVED: start == 0 && end == 0
    ///   - OPEN: block.timestamp >= start && block.timestamp <= end
    ///   - CLOSED: block.timestamp > end
    struct Trade {
        uint256 id;
        IERC20 sell;
        IERC20 buy;
        Range sellLimit; // D27{sellTok/share} min ratio of sell token to shares allowed, inclusive
        Range buyLimit; // D27{buyTok/share} min ratio of sell token to shares allowed, exclusive
        uint256 startPrice; // D27{buyTok/sellTok}
        uint256 endPrice; // D27{buyTok/sellTok}
        uint256 availableAt; // {s} inclusive
        uint256 launchTimeout; // {s} inclusive
        uint256 start; // {s} inclusive
        uint256 end; // {s} inclusive
        // === Gas optimization ===
        uint256 k; // D18{1} price = startPrice * e ^ -kt
    }

    function distributeFees() external;
}


interface IGovernanceDeployer {
    struct GovParams {
        // Basic Parameters
        uint48 votingDelay; // {s}
        uint32 votingPeriod; // {s}
        uint256 proposalThreshold; // D18{1}
        uint256 quorumPercent; // in percent, e.g 4 for 4%
        uint256 timelockDelay; // {s}
        // Roles
        address guardian; // Canceller Role
    }

    function deployGovernanceWithTimelock(
        IGovernanceDeployer.GovParams calldata govParams,
        IVotes stToken
    ) external returns (address governor, address timelock);
}

struct GovRoles {
    address[] existingTradeProposers;
    address[] tradeLaunchers;
    address[] vibesOfficers;
}


interface IFolioDeployer {
  error FolioDeployer__LengthMismatch();

  event FolioDeployed(address indexed folioOwner, address indexed folio, address folioAdmin);
  event GovernedFolioDeployed(
      address indexed stToken,
      address indexed folio,
      address ownerGovernor,
      address ownerTimelock,
      address tradingGovernor,
      address tradingTimelock
  );


  function folioImplementation() external view returns (address);
  function deployGovernedFolio(
    IVotes stToken,
    IFolio.FolioBasicDetails calldata basicDetails,
    IFolio.FolioAdditionalDetails calldata additionalDetails,
    IGovernanceDeployer.GovParams calldata ownerGovParams,
    IGovernanceDeployer.GovParams calldata tradingGovParams,
    GovRoles calldata govRoles
)
    external
    returns (
        address folio,
        address proxyAdmin,
        address ownerGovernor,
        address ownerTimelock,
        address tradingGovernor,
        address tradingTimelock
    );


}
