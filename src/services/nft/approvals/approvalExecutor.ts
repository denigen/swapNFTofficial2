import { Contract, JsonRpcSigner } from 'ethers';
import { NFTToken } from '../../../types/nft';
import { ERC721_ABI, ERC1155_ABI } from '../../../config/contracts/abis';
import { retryWithBackoff } from '../../../utils/retry';

export async function executeApprovals(
  nfts: NFTToken[],
  operatorAddress: string,
  signer: JsonRpcSigner
): Promise<void> {
  for (const nft of nfts) {
    try {
      // Try ERC721 first
      const contract = new Contract(nft.contractAddress, ERC721_ABI, signer);
      
      try {
        const tx = await retryWithBackoff(
          () => contract.setApprovalForAll(operatorAddress, true, {
            gasLimit: 100000
          }),
          3,
          1000
        );
        
        await tx.wait();
        console.log(`Approval granted for ERC721 contract ${nft.contractAddress}`);
        continue;
      } catch {
        // If ERC721 fails, try ERC1155
        const contract = new Contract(nft.contractAddress, ERC1155_ABI, signer);
        const tx = await retryWithBackoff(
          () => contract.setApprovalForAll(operatorAddress, true, {
            gasLimit: 100000
          }),
          3,
          1000
        );
        
        await tx.wait();
        console.log(`Approval granted for ERC1155 contract ${nft.contractAddress}`);
      }
    } catch (error) {
      console.error(`Failed to approve NFT ${nft.id}:`, error);
      throw new Error(`Failed to approve NFT ${nft.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}