// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title NFTSwap_HYPEREVM
 * @dev Peer-to-peer NFT swap contract for HyperEVM (native token: HYPE)
 *      Uses OpenZeppelin imports; ready for Remix/Foundry/Hardhat.
 */
contract NFTSwap_HYPEREVM is ReentrancyGuard, Pausable, Ownable {
    struct NFTDetails {
        address contractAddress;
        uint256 tokenId;
    }

    struct TokenDetails {
        string symbol;    // use "HYPE" when sending native HYPE
        uint256 amount;   // amount in wei
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

    mapping(bytes32 => SwapOrder) public swapOrders;
    uint256 public constant MAX_NFTS_PER_SWAP = 20;
    uint256 public constant ORDER_EXPIRY_TIME = 7 days;

    // Fees (in wei) and escrow tracking
    uint256 public swapFee = 50000000000000000; // 0.05 HYPE default
    uint256 public totalEscrowedHype; // total native HYPE currently escrowed for active orders

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
    event RoyaltyPaid(address indexed receiver, uint256 amount);
    event SwapFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeesWithdrawn(address indexed to, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Create a new swap order
     * @dev If makerToken.amount > 0, maker must send native HYPE equal to amount
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

        // Maker native HYPE escrow
        if (makerToken.amount > 0) {
            require(keccak256(bytes(makerToken.symbol)) == keccak256(bytes("HYPE")), "BAD_SYMBOL");
            require(msg.value == makerToken.amount, "BAD_MAKER_VALUE");
            // Track escrow so owner withdrawals can't touch funds reserved for swaps
            totalEscrowedHype += makerToken.amount;
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
     * @notice Execute an active swap order
     * @dev If takerToken.amount > 0, taker must send native HYPE equal to amount
     */
    function executeSwap(bytes32 orderId) external payable nonReentrant {
        SwapOrder storage order = swapOrders[orderId];
        require(order.isActive, "NOT_ACTIVE");
        require(msg.sender == order.taker, "NOT_TAKER");
        require(block.timestamp <= order.createdAt + ORDER_EXPIRY_TIME, "EXPIRED");

        // Collect swap fee (in addition to any taker payment)
        uint256 requiredValue = order.takerToken.amount;
        if (order.takerToken.amount > 0) {
            require(keccak256(bytes(order.takerToken.symbol)) == keccak256(bytes("HYPE")), "BAD_SYMBOL");
        }
        // Always charge swap fee for execution
        requiredValue += swapFee;
        require(msg.value == requiredValue, "BAD_EXECUTION_VALUE");

        // Forward taker's payment to maker (fee stays in contract)
        if (order.takerToken.amount > 0) {
            (bool ok1, ) = order.maker.call{value: order.takerToken.amount}("");
            require(ok1, "HYPE_TO_MAKER_FAIL");
        }

        // Maker native HYPE transfer (escrowed at create)
        if (order.makerToken.amount > 0) {
            require(keccak256(bytes(order.makerToken.symbol)) == keccak256(bytes("HYPE")), "BAD_SYMBOL");
            // Release escrowed HYPE to taker
            (bool ok2, ) = msg.sender.call{value: order.makerToken.amount}("");
            require(ok2, "HYPE_TO_TAKER_FAIL");
            // Reduce escrow tracker after successful payout
            totalEscrowedHype -= order.makerToken.amount;
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

        // Transfers
        for (uint256 i = 0; i < order.makerNFTs.length; i++) {
            _transferWithRoyalty(order.makerNFTs[i].contractAddress, order.makerNFTs[i].tokenId, order.maker, order.taker);
        }
        for (uint256 i = 0; i < order.takerNFTs.length; i++) {
            _transferWithRoyalty(order.takerNFTs[i].contractAddress, order.takerNFTs[i].tokenId, order.taker, order.maker);
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
            // Reduce escrow tracker on cancellation
            totalEscrowedHype -= order.makerToken.amount;
        }

        order.isActive = false;
        emit SwapOrderCancelled(orderId);
    }

    function _transferWithRoyalty(
        address nftContract,
        uint256 tokenId,
        address from,
        address to
    ) internal {
        // Probe 2981 (no payment calculation; emit event only for off-chain accounting)
        try IERC2981(nftContract).royaltyInfo(tokenId, 0) returns (address receiver, uint256 amount) {
            if (receiver != address(0) && amount > 0) {
                emit RoyaltyPaid(receiver, amount);
            }
        } catch {}

        IERC721(nftContract).transferFrom(from, to, tokenId);
    }

    // Admin
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
     * @notice Returns how much native HYPE can be withdrawn (excludes escrow)
     */
    function getWithdrawableBalance() public view returns (uint256) {
        uint256 bal = address(this).balance;
        if (bal <= totalEscrowedHype) return 0;
        return bal - totalEscrowedHype;
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


