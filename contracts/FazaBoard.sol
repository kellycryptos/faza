// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title FazaBoard
/// @notice A public board of short paid notes ("Fazas") on Arc Mainnet.
///         Readers pay USDC to unlock a note; authors are paid atomically.
///         Arc Mainnet USDC: 0x3600000000000000000000000000000000000000
contract FazaBoard is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─── Types ────────────────────────────────────────────────────────────────

    struct Faza {
        address author;
        uint256 priceUsdc; // 6-decimal USDC amount (e.g. 10000 = $0.01)
        bool exists;
    }

    // ─── Storage ──────────────────────────────────────────────────────────────

    /// @notice Arc Mainnet USDC address (same on every Arc network: mainnet + testnet)
    // TODO: verify against https://docs.arc.io/arc/references/contract-addresses
    address public constant USDC = 0x3600000000000000000000000000000000000000;

    mapping(address => mapping(bytes32 => Faza)) public fazas;

    /// @notice paid[reader][author][fazaId] = true after a successful pay()
    mapping(address => mapping(address => mapping(bytes32 => bool))) public paid;

    // ─── Events ───────────────────────────────────────────────────────────────

    event Published(bytes32 indexed fazaId, address indexed author, uint256 priceUsdc);
    event Paid(bytes32 indexed fazaId, address indexed reader, address indexed author, uint256 priceUsdc);
    // ─── Errors ───────────────────────────────────────────────────────────────

    error AlreadyExists();
    error DoesNotExist();
    error AlreadyPaid();
    error AuthorCannotPay();
    error PriceOutOfRange();

    // ─── Price bounds ─────────────────────────────────────────────────────────

    /// @dev $0.01 in 6-decimal USDC
    uint256 public constant MIN_PRICE = 10_000;
    /// @dev $1.00 in 6-decimal USDC
    uint256 public constant MAX_PRICE = 1_000_000;

    // ─── Write functions ──────────────────────────────────────────────────────

    /// @notice Publish a new Faza.
    /// @param fazaId   keccak256 identifier — the caller must choose a unique id.
    /// @param priceUsdc Price in 6-decimal USDC, between MIN_PRICE and MAX_PRICE inclusive.
    function publish(bytes32 fazaId, uint256 priceUsdc) external {
        if (fazas[msg.sender][fazaId].exists) revert AlreadyExists();
        if (priceUsdc < MIN_PRICE || priceUsdc > MAX_PRICE) revert PriceOutOfRange();

        fazas[msg.sender][fazaId] = Faza({
            author: msg.sender,
            priceUsdc: priceUsdc,
            exists: true
        });

        emit Published(fazaId, msg.sender, priceUsdc);
    }

    /// @notice Pay for a Faza. Pulls USDC from the reader and sends it to the author.
    ///         Caller must have approved this contract for at least `priceUsdc` USDC.
    ///         Reverts if the USDC transfer fails for any reason (e.g. insufficient
    ///         allowance, insufficient balance, or a Circle blocklist restriction).
    ///         unlock and payment are strictly atomic — no transfer means no unlock.
    /// @param author The author of the Faza (needed to look up the scoped storage slot).
    /// @param fazaId The id of the Faza to unlock.
    function pay(address author, bytes32 fazaId) external nonReentrant {
        Faza memory f = fazas[author][fazaId];
        if (!f.exists) revert DoesNotExist();
        if (paid[msg.sender][author][fazaId]) revert AlreadyPaid();
        if (msg.sender == f.author) revert AuthorCannotPay();

        // Transfer first — revert if it fails so paid is never set without funds moving.
        IERC20(USDC).safeTransferFrom(msg.sender, f.author, f.priceUsdc);

        // Mark paid AFTER the transfer succeeded.
        paid[msg.sender][author][fazaId] = true;

        emit Paid(fazaId, msg.sender, f.author, f.priceUsdc);
    }

    // ─── View functions ───────────────────────────────────────────────────────

    /// @notice Returns true if the reader has already paid for this Faza (alias for mapping access).
    function hasPaid(address reader, address author, bytes32 fazaId) external view returns (bool) {
        return paid[reader][author][fazaId];
    }

    /// @notice Returns Faza metadata (does NOT expose the body — body is stored off-chain).
    function getFaza(address author, bytes32 fazaId) external view returns (address fazaAuthor, uint256 priceUsdc, bool exists) {
        Faza memory f = fazas[author][fazaId];
        return (f.author, f.priceUsdc, f.exists);
    }
}
