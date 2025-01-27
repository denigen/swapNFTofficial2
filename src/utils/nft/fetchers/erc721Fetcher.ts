import { Contract } from 'ethers';
import { NFTToken } from '../../../types/nft';
import { ERC721_ABI } from '../../../config/contracts/abis';

export async function fetchERC721Tokens(
  contract: Contract,
  ownerAddress: string,
  chainId: number
): Promise<NFTToken[]> {
  const tokens: NFTToken[] = [];
  
  try {
    const balance = await contract.balanceOf(ownerAddress);
    if (balance <= 0) return tokens;

    const name = await contract.name().catch(() => 'Unknown Collection');
    const contractAddress = await contract.getAddress();
    
    for (let i = 0; i < balance; i++) {
      try {
        const tokenId = await contract.tokenOfOwnerByIndex(ownerAddress, i);
        tokens.push({
          id: `${contractAddress}-${tokenId}`,
          name: `${name} #${tokenId}`,
          collection: name,
          imageUrl: 'https://via.placeholder.com/150',
          contractAddress,
          tokenId: tokenId.toString(),
          chainId,
          standard: 'ERC721'
        });
      } catch (error) {
        console.warn(`Error fetching ERC721 token ${i}:`, error);
      }
    }
  } catch (error) {
    console.debug('Error fetching ERC721 tokens:', error);
  }

  return tokens;
}

export async function isERC721(contract: Contract): Promise<boolean> {
  try {
    await contract.supportsInterface('0x80ac58cd');
    return true;
  } catch {
    return false;
  }
}