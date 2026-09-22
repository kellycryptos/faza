// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FazaOTC is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum DealState {
        Open,
        Joined,
        Attested,
        Settled,
        Forfeit,
        Cancelled
    }

    struct Deal {
        address seller;
        address buyer;
        bytes32 termsHash;
        address asset;
        uint256 size;
        uint256 priceUsdc;
        uint256 stake;
        uint256 deadline;
        bool sellerAttested;
        bool buyerAttested;
        bool sellerDone;
        bool buyerDone;
        bool settled;
        DealState state;
    }

    mapping(uint256 => Deal) public deals;
    uint256 public dealCount;
    mapping(address => uint256) public claimable;

    address public constant USDC = 0x3600000000000000000000000000000000000000;
    uint256 public constant MIN_STAKE = 10_000;
    uint256 public constant MAX_STAKE = 100_000_000;
    uint256 public constant MAX_PRICE = 1_000_000_000_000;

    error NotFound();
    error NotSeller();
    error NotBuyer();
    error NotParty();
    error AlreadyJoined();
    error AlreadyAttested();
    error AlreadyDone();
    error AlreadySettled();
    error DeadlinePassed();
    error NotJoined();
    error NotAttested();
    error HashMismatch();
    error InvalidStake();
    error InvalidDeadline();
    error InvalidPrice();
    error NotSettleable();
    error NothingToClaim();
    error TokenTransferFailed();
    error CannotCancelJoined();

    event DealCreated(
        uint256 indexed dealId,
        address indexed seller,
        bytes32 termsHash,
        address asset,
        uint256 size,
        uint256 priceUsdc,
        uint256 stake,
        uint256 deadline
    );
    event DealJoined(uint256 indexed dealId, address indexed buyer);
    event DealAttested(uint256 indexed dealId, address indexed party);
    event DealDone(uint256 indexed dealId, address indexed party);
    event DealSettled(uint256 indexed dealId, bool pvp);
    event DealForfeited(uint256 indexed dealId, address winner);
    event DealCancelled(uint256 indexed dealId);
    event Claimed(address indexed who, uint256 amount);

    function create(
        bytes32 termsHash,
        address asset,
        uint256 size,
        uint256 priceUsdc,
        uint256 stake,
        uint256 deadline
    ) external returns (uint256 dealId) {
        if (stake < MIN_STAKE || stake > MAX_STAKE) revert InvalidStake();
        if (priceUsdc == 0 || priceUsdc > MAX_PRICE) revert InvalidPrice();
        if (deadline <= block.timestamp) revert InvalidDeadline();
        if (size == 0) revert InvalidPrice();

        IERC20(USDC).safeTransferFrom(msg.sender, address(this), stake);

        dealId = dealCount;
        deals[dealId] = Deal({
            seller: msg.sender,
            buyer: address(0),
            termsHash: termsHash,
            asset: asset,
            size: size,
            priceUsdc: priceUsdc,
            stake: stake,
            deadline: deadline,
            sellerAttested: false,
            buyerAttested: false,
            sellerDone: false,
            buyerDone: false,
            settled: false,
            state: DealState.Open
        });

        dealCount = dealId + 1;

        emit DealCreated(dealId, msg.sender, termsHash, asset, size, priceUsdc, stake, deadline);
    }

    function join(uint256 dealId, bytes32 termsHash) external nonReentrant {
        Deal storage deal = deals[dealId];

        if (deal.seller == address(0)) revert NotFound();
        if (deal.state != DealState.Open) revert AlreadyJoined();
        if (deal.buyer != address(0)) revert AlreadyJoined();
        if (block.timestamp >= deal.deadline) revert DeadlinePassed();
        if (msg.sender == deal.seller) revert NotParty();
        if (termsHash != deal.termsHash) revert HashMismatch();

        uint256 amountToPull = deal.stake;
        if (deal.asset != address(0)) {
            amountToPull += deal.priceUsdc;
        }

        IERC20(USDC).safeTransferFrom(msg.sender, address(this), amountToPull);

        deal.buyer = msg.sender;
        deal.state = DealState.Joined;

        emit DealJoined(dealId, msg.sender);
    }

    function attest(uint256 dealId) external {
        Deal storage deal = deals[dealId];

        if (deal.seller == address(0)) revert NotFound();
        if (deal.state != DealState.Joined) revert NotJoined();
        if (deal.settled) revert AlreadySettled();
        if (block.timestamp >= deal.deadline) revert DeadlinePassed();

        if (msg.sender == deal.seller) {
            if (deal.sellerAttested) revert AlreadyAttested();
            deal.sellerAttested = true;
        } else if (msg.sender == deal.buyer) {
            if (deal.buyerAttested) revert AlreadyAttested();
            deal.buyerAttested = true;
        } else {
            revert NotParty();
        }

        if (deal.sellerAttested && deal.buyerAttested) {
            deal.state = DealState.Attested;
        }

        emit DealAttested(dealId, msg.sender);
    }

    function confirmDone(uint256 dealId) external {
        Deal storage deal = deals[dealId];

        if (deal.seller == address(0)) revert NotFound();
        if (deal.state != DealState.Joined && deal.state != DealState.Attested) revert NotJoined();
        if (block.timestamp >= deal.deadline) revert DeadlinePassed();
        if (deal.settled) revert AlreadySettled();

        if (msg.sender == deal.seller) {
            if (deal.sellerDone) revert AlreadyDone();
            deal.sellerDone = true;
        } else if (msg.sender == deal.buyer) {
            if (deal.buyerDone) revert AlreadyDone();
            deal.buyerDone = true;
        } else {
            revert NotParty();
        }

        emit DealDone(dealId, msg.sender);
    }

    function settle(uint256 dealId) external nonReentrant {
        Deal storage deal = deals[dealId];

        if (deal.seller == address(0)) revert NotFound();
        if (deal.buyer == address(0)) revert NotJoined();
        if (block.timestamp < deal.deadline) revert NotSettleable();
        if (deal.settled) revert AlreadySettled();
        // PvP: both parties must have attested before settlement can finalise.
        if (deal.asset != address(0) && (!deal.sellerAttested || !deal.buyerAttested)) revert NotAttested();

        deal.settled = true;
        deal.state = DealState.Settled;

        if (deal.asset != address(0)) {
            claimable[deal.seller] += deal.priceUsdc;
            claimable[deal.seller] += deal.stake;
            claimable[deal.buyer] += deal.stake;

            try this._transferAsset(deal.asset, deal.seller, deal.buyer, deal.size) {
                emit DealSettled(dealId, true);
            } catch {
                claimable[deal.seller] -= deal.priceUsdc;
                claimable[deal.seller] -= deal.stake;
                claimable[deal.buyer] += deal.priceUsdc;
                claimable[deal.buyer] += deal.stake;
                deal.state = DealState.Forfeit;
                emit DealForfeited(dealId, deal.buyer);
            }
        } else {
            if (deal.sellerDone && deal.buyerDone) {
                claimable[deal.seller] += deal.stake;
                claimable[deal.buyer] += deal.stake;
            } else if (deal.sellerDone) {
                claimable[deal.seller] += deal.stake * 2;
            } else if (deal.buyerDone) {
                claimable[deal.buyer] += deal.stake * 2;
            } else {
                claimable[deal.seller] += deal.stake;
                claimable[deal.buyer] += deal.stake;
            }

            emit DealSettled(dealId, false);
        }
    }

    function _transferAsset(address asset, address from, address to, uint256 amount) external {
        if (msg.sender != address(this)) revert TokenTransferFailed();
        IERC20(asset).safeTransferFrom(from, to, amount);
    }

    function cancel(uint256 dealId) external nonReentrant {
        Deal storage deal = deals[dealId];

        if (deal.seller == address(0)) revert NotFound();
        if (msg.sender != deal.seller) revert NotSeller();
        if (deal.settled) revert AlreadySettled();
        if (deal.buyer != address(0) || deal.state != DealState.Open) revert CannotCancelJoined();
        if (block.timestamp < deal.deadline) revert InvalidDeadline();

        deal.settled = true;
        deal.state = DealState.Cancelled;
        claimable[deal.seller] += deal.stake;

        emit DealCancelled(dealId);
    }

    function claim() external nonReentrant {
        uint256 amount = claimable[msg.sender];
        if (amount == 0) revert NothingToClaim();

        claimable[msg.sender] = 0;
        IERC20(USDC).safeTransfer(msg.sender, amount);

        emit Claimed(msg.sender, amount);
    }

    function getDeal(uint256 dealId) external view returns (Deal memory) {
        return deals[dealId];
    }

    function canJoin(uint256 dealId) external view returns (bool) {
        Deal storage deal = deals[dealId];
        return deal.seller != address(0)
            && deal.state == DealState.Open
            && deal.buyer == address(0)
            && block.timestamp < deal.deadline;
    }

    function canAttest(uint256 dealId, address who) external view returns (bool) {
        Deal storage deal = deals[dealId];
        if (deal.seller == address(0)) return false;
        if (deal.state != DealState.Joined || deal.settled || block.timestamp >= deal.deadline) return false;

        if (who == deal.seller) return !deal.sellerAttested;
        if (who == deal.buyer) return !deal.buyerAttested;
        return false;
    }

    function canConfirmDone(uint256 dealId, address who) external view returns (bool) {
        Deal storage deal = deals[dealId];
        if (deal.seller == address(0)) return false;
        if ((deal.state != DealState.Joined && deal.state != DealState.Attested) || deal.settled || block.timestamp >= deal.deadline)
        {
            return false;
        }

        if (who == deal.seller) return !deal.sellerDone;
        if (who == deal.buyer) return !deal.buyerDone;
        return false;
    }

    function canSettle(uint256 dealId) external view returns (bool) {
        Deal storage deal = deals[dealId];
        return deal.seller != address(0)
            && deal.buyer != address(0)
            && block.timestamp >= deal.deadline
            && !deal.settled;
    }

    function canCancel(uint256 dealId) external view returns (bool) {
        Deal storage deal = deals[dealId];
        return deal.seller == msg.sender
            && deal.state == DealState.Open
            && deal.buyer == address(0)
            && block.timestamp >= deal.deadline
            && !deal.settled;
    }
}
