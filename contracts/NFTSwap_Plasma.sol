// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title NFTSwap_Plasma
 * @dev Peer-to-peer NFT swap contract for Plasma (native token: XPL)
 *      Supports native XPL payments + NFTs. No royalty handling. Includes
 *      admin-settable swap fee, and owner withdrawal limited to accrued fees.
 */
contract NFTSwap_Plasma is ReentrancyGuard, Pausable, Ownable {
    struct NFTDetails {
        address contractAddress;
        uint256 tokenId;
    }

    struct TokenDetails {
        // Use "XPL" when sending native payments
        string symbol;
        // Amount in wei (18 decimals)
        uint256 amount;
    }

    struct SwapOrder {
        address maker;
        address taker;
        NFTDetails[] makerNFTs;
        NFTDetails[] takerNFTs;
        TokenDetails makerToken;
        TokenDetails takerToken;
        uint256 createdAt;
        bool isActive;
    }

    // Storage
    mapping(bytes32 => SwapOrder) public swapOrders;
    uint256 public constant MAX_NFTS_PER_SWAP = 20;
    uint256 public constant ORDER_EXPIRY_TIME = 7 days;

    // Fees (in wei) and escrow tracking
    // Default: 3 XPL fee per executed swap
    uint256 public swapFee = 3 ether;
    // Total native XPL currently escrowed for active orders (maker deposits)
    uint256 public totalEscrowedXpl;

    // Events
    event SwapOrderCreated(
        bytes32 indexed orderId,
        address indexed maker,
        address indexed taker,
        NFTDetails[] makerNFTs,
        NFTDetails[] takerNFTs,
        TokenDetails makerToken,
        TokenDetails takerToken
    );
    event SwapOrderExecuted(bytes32 indexed orderId);
    event SwapOrderCancelled(bytes32 indexed orderId);
    event SwapFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeesWithdrawn(address indexed to, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Create a new swap order.
     * @dev If makerToken.amount > 0, caller must send native XPL equal to amount.
     */
    function createSwapOrder(
        NFTDetails[] calldata makerNFTs,
        NFTDetails[] calldata takerNFTs,
        TokenDetails calldata makerToken,
        TokenDetails calldata takerToken,
        address taker
    ) external payable whenNotPaused nonReentrant returns (bytes32) {
        require(makerNFTs.length > 0 || makerToken.amount > 0, "NO_MAKER_ASSETS");
        require(takerNFTs.length > 0 || takerToken.amount > 0, "NO_TAKER_ASSETS");
        require(taker != address(0), "INVALID_TAKER");
        require(taker != msg.sender, "SELF_SWAP");
        require(makerNFTs.length + takerNFTs.length <= MAX_NFTS_PER_SWAP, "TOO_MANY_NFTS");

        // Verify maker NFT ownership and approvals
        for (uint256 i = 0; i < makerNFTs.length; i++) {
            address c = makerNFTs[i].contractAddress;
            uint256 id = makerNFTs[i].tokenId;
            require(IERC721(c).ownerOf(id) == msg.sender, "NOT_OWNER");
            require(
                IERC721(c).isApprovedForAll(msg.sender, address(this)) ||
                IERC721(c).getApproved(id) == address(this),
                "NOT_APPROVED"
            );
        }

        // Maker native XPL escrow
        if (makerToken.amount > 0) {
            require(keccak256(bytes(makerToken.symbol)) == keccak256(bytes("XPL")), "BAD_SYMBOL");
            require(msg.value == makerToken.amount, "BAD_MAKER_VALUE");
            totalEscrowedXpl += makerToken.amount;
        } else {
            require(msg.value == 0, "UNEXPECTED_VALUE");
        }

        bytes32 orderId = keccak256(abi.encode(
            msg.sender,
            taker,
            block.timestamp,
            makerNFTs,
            takerNFTs,
            makerToken,
            takerToken
        ));
        require(!swapOrders[orderId].isActive, "ORDER_EXISTS");

        SwapOrder storage order = swapOrders[orderId];
        order.maker = msg.sender;
        order.taker = taker;
        order.createdAt = block.timestamp;
        order.isActive = true;
        order.makerToken = makerToken;
        order.takerToken = takerToken;

        for (uint256 i = 0; i < makerNFTs.length; i++) {
            order.makerNFTs.push(makerNFTs[i]);
        }
        for (uint256 i = 0; i < takerNFTs.length; i++) {
            order.takerNFTs.push(takerNFTs[i]);
        }

        emit SwapOrderCreated(orderId, msg.sender, taker, makerNFTs, takerNFTs, makerToken, takerToken);
        return orderId;
    }

    /**
     * @notice Execute an active swap order.
     * @dev If takerToken.amount > 0, taker must send native XPL equal to amount + swapFee.
     */
    function executeSwap(bytes32 orderId) external payable nonReentrant {
        SwapOrder storage order = swapOrders[orderId];
        require(order.isActive, "NOT_ACTIVE");
        require(msg.sender == order.taker, "NOT_TAKER");
        require(block.timestamp <= order.createdAt + ORDER_EXPIRY_TIME, "EXPIRED");

        uint256 requiredValue = order.takerToken.amount;
        if (order.takerToken.amount > 0) {
            require(keccak256(bytes(order.takerToken.symbol)) == keccak256(bytes("XPL")), "BAD_SYMBOL");
        }
        // Always include swap fee
        requiredValue += swapFee;
        require(msg.value == requiredValue, "BAD_EXECUTION_VALUE");

        // Forward taker's native payment to maker (fee stays in contract)
        if (order.takerToken.amount > 0) {
            (bool ok1, ) = order.maker.call{value: order.takerToken.amount}("");
            require(ok1, "XPL_TO_MAKER_FAIL");
        }

        // Release maker escrowed native XPL to taker
        if (order.makerToken.amount > 0) {
            require(keccak256(bytes(order.makerToken.symbol)) == keccak256(bytes("XPL")), "BAD_SYMBOL");
            (bool ok2, ) = msg.sender.call{value: order.makerToken.amount}("");
            require(ok2, "XPL_TO_TAKER_FAIL");
            totalEscrowedXpl -= order.makerToken.amount;
        }

        // Verify taker NFTs ownership and approvals
        for (uint256 i = 0; i < order.takerNFTs.length; i++) {
            address c = order.takerNFTs[i].contractAddress;
            uint256 id = order.takerNFTs[i].tokenId;
            require(IERC721(c).ownerOf(id) == msg.sender, "NOT_OWNER");
            require(
                IERC721(c).isApprovedForAll(msg.sender, address(this)) ||
                IERC721(c).getApproved(id) == address(this),
                "NOT_APPROVED"
            );
        }

        // Transfers (no royalty handling)
        for (uint256 i = 0; i < order.makerNFTs.length; i++) {
            IERC721(order.makerNFTs[i].contractAddress).transferFrom(order.maker, order.taker, order.makerNFTs[i].tokenId);
        }
        for (uint256 i = 0; i < order.takerNFTs.length; i++) {
            IERC721(order.takerNFTs[i].contractAddress).transferFrom(order.taker, order.maker, order.takerNFTs[i].tokenId);
        }

        order.isActive = false;
        emit SwapOrderExecuted(orderId);
    }

    /**
     * @notice Cancel a swap order (maker only)
     */
    function cancelSwap(bytes32 orderId) external {
        SwapOrder storage order = swapOrders[orderId];
        require(order.isActive, "NOT_ACTIVE");
        require(msg.sender == order.maker, "NOT_MAKER");

        if (order.makerToken.amount > 0) {
            (bool ok, ) = order.maker.call{value: order.makerToken.amount}("");
            require(ok, "REFUND_FAIL");
            totalEscrowedXpl -= order.makerToken.amount;
        }

        order.isActive = false;
        emit SwapOrderCancelled(orderId);
    }

    // Admin controls
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    /**
     * @notice Update the swap execution fee (denominated in wei)
     */
    function setSwapFee(uint256 newFee) external onlyOwner {
        uint256 old = swapFee;
        swapFee = newFee;
        emit SwapFeeUpdated(old, newFee);
    }

    /**
     * @notice Returns how much native XPL can be withdrawn (excludes escrow)
     */
    function getWithdrawableBalance() public view returns (uint256) {
        uint256 bal = address(this).balance;
        if (bal <= totalEscrowedXpl) return 0;
        return bal - totalEscrowedXpl;
    }

    /**
     * @notice Withdraw available fees (and any excess balance) to an address
     */
    function withdrawFees(address payable to, uint256 amount) external onlyOwner {
        require(to != address(0), "BAD_TO");
        uint256 available = getWithdrawableBalance();
        require(amount <= available, "AMOUNT_EXCEEDS_AVAILABLE");
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "WITHDRAW_FAIL");
        emit FeesWithdrawn(to, amount);
    }

    receive() external payable {}
}



