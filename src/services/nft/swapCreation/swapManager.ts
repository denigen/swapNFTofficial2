import { Contract, JsonRpcSigner } from 'ethers';
import { NFTToken } from '../../../types/nft';
import { SWAP_CONTRACT_ADDRESSES } from '../../../config/contracts/addresses';
import { SWAP_ABI } from '../../../config/contracts/abis';
import { verifyNFTOwnership } from '../ownership';
import { approveNFTContract } from '../approvals/approvalManager';

interface SwapCreationParams {
  fromNFTs: NFTToken[];
  toNFTs: NFTToken[];
  counterpartyAddress: string;
}

interface SwapResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export async function createSwap(
  signer: JsonRpcSigner,
  params: SwapCreationParams
): Promise<SwapResult> {
  try {
    const network = await signer.provider.getNetwork();
    const chainId = Number(network.chainId);
    const address = await signer.getAddress();

    // Validate contract deployment
    const swapContractAddress = SWAP_CONTRACT_ADDRESSES[chainId];
    if (!swapContractAddress) {
      throw new Error('Swap contract not deployed on current network');
    }

    // Verify ownership and approve NFTs
    await verifyAndApproveNFTs(
      params.fromNFTs,
      address,
      chainId,
      swapContractAddress,
      signer
    );

    // Create swap contract instance
    const swapContract = new Contract(swapContractAddress, SWAP_ABI, signer);

    // Format NFT details
    const makerNFTs = formatNFTsForContract(params.fromNFTs);
    const takerNFTs = formatNFTsForContract(params.toNFTs);

    // Create swap order
    console.log('Creating swap order:', {
      makerNFTs,
      takerNFTs,
      counterparty: params.counterpartyAddress
    });

    const tx = await swapContract.createSwapOrder(
      makerNFTs,
      takerNFTs,
      params.counterpartyAddress,
      { gasLimit: 1000000 }
    );

    const receipt = await tx.wait();
    
    return {
      success: true,
      txHash: receipt.hash
    };
  } catch (error) {
    console.error('Swap creation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

async function verifyAndApproveNFTs(
  nfts: NFTToken[],
  ownerAddress: string,
  chainId: number,
  operatorAddress: string,
  signer: JsonRpcSigner
): Promise<void> {
  for (const nft of nfts) {
    // Verify ownership
    const { isOwner, error } = await verifyNFTOwnership(
      nft.contractAddress,
      nft.tokenId,
      ownerAddress,
      chainId
    );

    if (!isOwner) {
      throw new Error(`Failed to verify ownership of NFT: ${nft.name}${error ? ` - ${error}` : ''}`);
    }

    // Set approval
    try {
      await approveNFTContract(nft.contractAddress, operatorAddress, signer);
    } catch (error) {
      throw new Error(`Failed to approve NFT: ${nft.name} - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

function formatNFTsForContract(nfts: NFTToken[]) {
  return nfts.map(nft => ({
    contractAddress: nft.contractAddress,
    tokenId: BigInt(nft.tokenId)
  }));
}