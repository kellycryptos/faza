// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FazaBond is ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Bond {
        address creator;
        address joiner;
        uint256 stake;
        uint256 deadline;
        string title;
        bool creatorIn;
        bool joinerIn;
        bool settled;
    }

    mapping(uint256 => Bond) public bonds;
    mapping(address => uint256) public claimable;
    uint256 public bondCount;

    // TODO: verified from https://docs.arc.io/arc/references/contract-addresses
    address public constant USDC = 0x3600000000000000000000000000000000000000;

    error BondNotFound();
    error AlreadyJoined();
    error DeadlinePassed();
    error NotParty();
    error NotCreator();
    error AlreadySettled();
    error NotSettleable();
    error InvalidStake();
    error InvalidDeadline();
    error AlreadyCheckedIn();
    error NothingToClaim();
    error NotCancellable();

    event Created(uint256 indexed bondId, address indexed creator, uint256 stake, uint256 deadline, string title);
    event Joined(uint256 indexed bondId, address indexed joiner);
    event CheckedIn(uint256 indexed bondId, address indexed who);
    event Settled(uint256 indexed bondId, address indexed creator, address indexed joiner, bool creatorIn, bool joinerIn);
    event Cancelled(uint256 indexed bondId, address indexed creator);
    event Claimed(address indexed who, uint256 amount);

    function create(string calldata title, uint256 stake, uint256 deadline) external returns (uint256 bondId) {
        if (stake < 10_000 || stake > 100_000_000) revert InvalidStake();
        if (deadline <= block.timestamp) revert InvalidDeadline();

        IERC20(USDC).safeTransferFrom(msg.sender, address(this), stake);

        bondId = bondCount;
        bonds[bondId] = Bond({
            creator: msg.sender,
            joiner: address(0),
            stake: stake,
            deadline: deadline,
            title: title,
            creatorIn: false,
            joinerIn: false,
            settled: false
        });

        bondCount = bondId + 1;

        emit Created(bondId, msg.sender, stake, deadline, title);
    }

    function join(uint256 bondId) external nonReentrant {
        Bond storage bond = bonds[bondId];

        if (bond.creator == address(0)) revert BondNotFound();
        if (bond.joiner != address(0)) revert AlreadyJoined();
        if (block.timestamp >= bond.deadline) revert DeadlinePassed();
        if (msg.sender == bond.creator) revert NotParty();

        IERC20(USDC).safeTransferFrom(msg.sender, address(this), bond.stake);

        bond.joiner = msg.sender;

        emit Joined(bondId, msg.sender);
    }

    function checkIn(uint256 bondId) external {
        Bond storage bond = bonds[bondId];

        if (bond.creator == address(0)) revert BondNotFound();
        if (bond.joiner == address(0)) revert NotSettleable();
        if (block.timestamp >= bond.deadline) revert DeadlinePassed();
        if (bond.settled) revert AlreadySettled();

        if (msg.sender == bond.creator) {
            if (bond.creatorIn) revert AlreadyCheckedIn();
            bond.creatorIn = true;
        } else if (msg.sender == bond.joiner) {
            if (bond.joinerIn) revert AlreadyCheckedIn();
            bond.joinerIn = true;
        } else {
            revert NotParty();
        }

        emit CheckedIn(bondId, msg.sender);
    }

    function settle(uint256 bondId) external nonReentrant {
        Bond storage bond = bonds[bondId];

        if (bond.creator == address(0)) revert BondNotFound();
        if (bond.joiner == address(0) || block.timestamp < bond.deadline) revert NotSettleable();
        if (bond.settled) revert AlreadySettled();

        bond.settled = true;

        uint256 stake = bond.stake;
        uint256 total = stake * 2;

        emit Settled(bondId, bond.creator, bond.joiner, bond.creatorIn, bond.joinerIn);

        if (bond.creatorIn && bond.joinerIn) {
            claimable[bond.creator] += stake;
            claimable[bond.joiner] += stake;
        } else if (bond.creatorIn) {
            claimable[bond.creator] += total;
        } else if (bond.joinerIn) {
            claimable[bond.joiner] += total;
        } else {
            claimable[bond.creator] += stake;
            claimable[bond.joiner] += stake;
        }
    }

    function cancel(uint256 bondId) external {
        Bond storage bond = bonds[bondId];

        if (bond.creator == address(0)) revert BondNotFound();
        if (bond.creator != msg.sender) revert NotCreator();
        if (bond.joiner != address(0)) revert AlreadyJoined();
        if (block.timestamp < bond.deadline) revert NotCancellable();
        if (bond.settled) revert AlreadySettled();

        bond.settled = true;
        claimable[bond.creator] += bond.stake;

        emit Cancelled(bondId, bond.creator);
    }

    function claim() external nonReentrant {
        uint256 amount = claimable[msg.sender];
        if (amount == 0) revert NothingToClaim();

        claimable[msg.sender] = 0;
        IERC20(USDC).safeTransfer(msg.sender, amount);

        emit Claimed(msg.sender, amount);
    }

    function getBond(uint256 bondId) external view returns (Bond memory) {
        return bonds[bondId];
    }

    function canJoin(uint256 bondId) external view returns (bool) {
        Bond storage bond = bonds[bondId];
        return bond.creator != address(0) && bond.joiner == address(0) && block.timestamp < bond.deadline;
    }

    function canCheckIn(uint256 bondId, address who) external view returns (bool) {
        Bond storage bond = bonds[bondId];
        bool isParty = who == bond.creator || who == bond.joiner;
        return bond.creator != address(0)
            && bond.joiner != address(0)
            && block.timestamp < bond.deadline
            && !bond.settled
            && isParty;
    }

    function canSettle(uint256 bondId) external view returns (bool) {
        Bond storage bond = bonds[bondId];
        return bond.creator != address(0)
            && bond.joiner != address(0)
            && block.timestamp >= bond.deadline
            && !bond.settled;
    }
}
