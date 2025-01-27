import { Contract } from 'ethers';
import { NFTToken } from '../../../types/nft';
import { ERC721_ABI, ERC1155_ABI } from '../../../config/contracts/abis';
import { getProvider } from '../../../utils/providers/rpcProvider';
import { retryWithBackoff } from '../../../utils/retry';

export async function checkOrderApprovals(
  nfts: NFTToken[],
  ownerAddress: string,
  operatorAddress: string,
  chainId: number
): Promise<NFTToken[]> {
  const provider = await getProvider(chainId);
  const needsApproval: NFTToken[] = [];

  for (const nft of nfts) {
    try {
      // Try ERC721 first
      const contract = new Contract(nft.contractAddress, ERC721_ABI, provider);
      
      // Check both approval types with retry
      const [isApprovedForAll, tokenApproval] = await Promise.all([
        retryWithBackoff(
          () => contract.isApprovedForAll(ownerAddress, operatorAddress),
          3,
          1000
        ),
        retryWithBackoff(
          () => contract.getApproved(nft.tokenId),
          3,
          1000
        )
      ]);

      // Add to needsApproval if neither approval type is valid
      if (!isApprovedForAll && tokenApproval.toLowerCase() !== operatorAddress.toLowerCase()) {
        needsApproval.push(nft);
      }
    } catch {
      // If ERC721 fails, try ERC1155
      try {
        const contract = new Contract(nft.contractAddress, ERC1155_ABI, provider);
        const isApproved = await retryWithBackoff(
          () => contract.isApprovedForAll(ownerAddress, operatorAddress),
          3,
          1000
        );

        if (!isApproved) {
          needsApproval.push(nft);
        }
      } catch (error) {
        console.warn(`Failed to check approvals for NFT ${nft.id}:`, error);
        needsApproval.push(nft); // Add to needsApproval if checks fail
      }
    }
  }

  return needsApproval;
}