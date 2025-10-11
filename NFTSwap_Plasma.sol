// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

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
        // Use "XPL" for native payments; other symbols are treated as ERC20 and resolved via tokenAddresses mapping
        string symbol;
        // Amount in wei (18 decimals) or token decimals
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
    // ERC20 registry to support adding tokens without redeploys
    mapping(string => address) public tokenAddresses;

    // Fee whitelist: addresses or NFT collections that waive swap fees
    mapping(address => bool) private feeWhitelistAddresses;
    mapping(address => bool) private feeWhitelistCollections;

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

    // Whitelist events
    event FeeWhitelistAddressUpdated(address indexed account, bool isWhitelisted);
    event FeeWhitelistCollectionUpdated(address indexed collection, bool isWhitelisted);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Sets the token contract address for a given symbol (for ERC20 payments)
     */
    function setTokenAddress(string calldata symbol, address tokenAddress) external onlyOwner {
        require(tokenAddress != address(0), "BAD_ADDRESS");
        tokenAddresses[symbol] = tokenAddress;
    }

    /**
     * @dev Adds or removes an address from the fee whitelist
     */
    function setFeeWhitelistAddress(address account, bool isWhitelisted) external onlyOwner {
        require(account != address(0), "BAD_ADDRESS");
        feeWhitelistAddresses[account] = isWhitelisted;
        emit FeeWhitelistAddressUpdated(account, isWhitelisted);
    }

    /**
     * @dev Adds or removes an NFT collection from the fee whitelist
     */
    function setFeeWhitelistCollection(address collection, bool isWhitelisted) external onlyOwner {
        require(collection != address(0), "BAD_COLLECTION");
        feeWhitelistCollections[collection] = isWhitelisted;
        emit FeeWhitelistCollectionUpdated(collection, isWhitelisted);
    }

    /**
     * @dev View helper to check if an address is fee-whitelisted
     */
    function isAddressWhitelistedForFee(address account) external view returns (bool) {
        return feeWhitelistAddresses[account];
    }

    /**
     * @dev View helper to check if a collection is fee-whitelisted
     */
    function isCollectionWhitelistedForFee(address collection) external view returns (bool) {
        return feeWhitelistCollections[collection];
    }

    /**
     * @dev Internal helper: waive if maker/taker or any involved collection is whitelisted
     */
    function isFeeWaivedForOrder(SwapOrder storage order) internal view returns (bool) {
        if (feeWhitelistAddresses[order.maker] || feeWhitelistAddresses[order.taker]) {
            return true;
        }
        for (uint256 i = 0; i < order.makerNFTs.length; i++) {
            if (feeWhitelistCollections[order.makerNFTs[i].contractAddress]) {
                return true;
            }
        }
        for (uint256 j = 0; j < order.takerNFTs.length; j++) {
            if (feeWhitelistCollections[order.takerNFTs[j].contractAddress]) {
                return true;
            }
        }
        return false;
    }

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

        // Maker payment escrow
        if (makerToken.amount > 0) {
            if (keccak256(bytes(makerToken.symbol)) == keccak256(bytes("XPL"))) {
                require(msg.value == makerToken.amount, "BAD_MAKER_VALUE");
                totalEscrowedXpl += makerToken.amount;
            } else {
                address tokenAddr = tokenAddresses[makerToken.symbol];
                require(tokenAddr != address(0), "BAD_SYMBOL");
                require(msg.value == 0, "UNEXPECTED_VALUE");
                require(IERC20(tokenAddr).transferFrom(msg.sender, address(this), makerToken.amount), "ERC20_ESCROW_FAIL");
            }
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

        uint256 fee = isFeeWaivedForOrder(order) ? 0 : swapFee;
        uint256 requiredValue = fee;
        if (order.takerToken.amount > 0) {
            if (keccak256(bytes(order.takerToken.symbol)) == keccak256(bytes("XPL"))) {
                requiredValue += order.takerToken.amount;
            } else {
                address takerTokenAddr = tokenAddresses[order.takerToken.symbol];
                require(takerTokenAddr != address(0), "BAD_SYMBOL");
                // Pull ERC20 from taker directly to maker
                require(IERC20(takerTokenAddr).transferFrom(msg.sender, order.maker, order.takerToken.amount), "ERC20_TO_MAKER_FAIL");
            }
        }
        require(msg.value == requiredValue, "BAD_EXECUTION_VALUE");

        // Forward taker's native payment to maker (fee stays in contract)
        if (order.takerToken.amount > 0 && keccak256(bytes(order.takerToken.symbol)) == keccak256(bytes("XPL"))) {
            (bool ok1, ) = order.maker.call{value: order.takerToken.amount}("");
            require(ok1, "XPL_TO_MAKER_FAIL");
        }

        // Release maker escrowed native XPL to taker
        if (order.makerToken.amount > 0) {
            if (keccak256(bytes(order.makerToken.symbol)) == keccak256(bytes("XPL"))) {
                (bool ok2, ) = msg.sender.call{value: order.makerToken.amount}("");
                require(ok2, "XPL_TO_TAKER_FAIL");
                totalEscrowedXpl -= order.makerToken.amount;
            } else {
                address makerTokenAddr = tokenAddresses[order.makerToken.symbol];
                require(makerTokenAddr != address(0), "BAD_SYMBOL");
                require(IERC20(makerTokenAddr).transfer(msg.sender, order.makerToken.amount), "ERC20_TO_TAKER_FAIL");
            }
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
     * @notice Cancel a swap order (maker or taker)
     */
    function cancelSwap(bytes32 orderId) external {
        SwapOrder storage order = swapOrders[orderId];
        require(order.isActive, "NOT_ACTIVE");
        require(msg.sender == order.maker || msg.sender == order.taker, "NOT_PARTY");

        if (order.makerToken.amount > 0) {
            if (keccak256(bytes(order.makerToken.symbol)) == keccak256(bytes("XPL"))) {
                (bool ok, ) = order.maker.call{value: order.makerToken.amount}("");
                require(ok, "REFUND_FAIL");
                totalEscrowedXpl -= order.makerToken.amount;
            } else {
                address makerTokenAddr = tokenAddresses[order.makerToken.symbol];
                require(makerTokenAddr != address(0), "BAD_SYMBOL");
                require(IERC20(makerTokenAddr).transfer(order.maker, order.makerToken.amount), "ERC20_REFUND_FAIL");
            }
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



