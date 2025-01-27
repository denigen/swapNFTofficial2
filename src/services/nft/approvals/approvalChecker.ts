import { Contract } from 'ethers';
import { NFTToken } from '../../../types/nft';
import { ERC721_ABI } from '../../../config/contracts/abis';
import { getProvider } from '../../../utils/providers/rpcProvider';

export async function checkNFTApprovals(
  nfts: NFTToken[],
  ownerAddress: string,
  operatorAddress: string,
  chainId: number
): Promise<NFTToken[]> {
  const provider = await getProvider(chainId);
  const needsApproval: NFTToken[] = [];

  for (const nft of nfts) {
    const contract = new Contract(nft.contractAddress, ERC721_ABI, provider);
    
    try {
      const isApproved = await contract.isApprovedForAll(ownerAddress, operatorAddress);
      if (!isApproved) {
        const tokenApproved = await contract.getApproved(nft.tokenId);
        if (tokenApproved.toLowerCase() !== operatorAddress.toLowerCase()) {
          needsApproval.push(nft);
        }
      }
    } catch (error) {
      console.warn(`Error checking approval for NFT ${nft.id}:`, error);
      needsApproval.push(nft);
    }
  }

  return needsApproval;
}