import { Contract } from 'ethers';
import { NFTToken } from '../../../types/nft';
import { ERC1155_ABI } from '../../../config/contracts/abis';

export async function fetchERC1155Tokens(
  contract: Contract,
  ownerAddress: string,
  chainId: number
): Promise<NFTToken[]> {
  const tokens: NFTToken[] = [];
  
  try {
    const name = await contract.name().catch(() => 'Unknown Collection');
    const contractAddress = await contract.getAddress();
    
    // Check first 100 token IDs
    for (let tokenId = 0; tokenId < 100; tokenId++) {
      try {
        const balance = await contract.balanceOf(ownerAddress, tokenId);
        if (balance > 0) {
          tokens.push({
            id: `${contractAddress}-${tokenId}`,
            name: `${name} #${tokenId}`,
            collection: name,
            imageUrl: 'https://via.placeholder.com/150',
            contractAddress,
            tokenId: tokenId.toString(),
            chainId,
            standard: 'ERC1155',
            balance: Number(balance)
          });
        }
      } catch {
        continue;
      }
    }
  } catch (error) {
    console.debug('Error fetching ERC1155 tokens:', error);
  }

  return tokens;
}

export async function isERC1155(contract: Contract): Promise<boolean> {
  try {
    await contract.supportsInterface('0xd9b67a26');
    return true;
  } catch {
    return false;
  }
}