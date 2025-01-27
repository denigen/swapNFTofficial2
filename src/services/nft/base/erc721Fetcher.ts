import { JsonRpcProvider, Contract } from 'ethers';
import { NFTToken } from '../../../types/nft';
import { ERC721_ABI } from '../../../config/contracts/abis';

export async function fetchERC721Tokens(
  provider: JsonRpcProvider,
  contractAddress: string,
  ownerAddress: string
): Promise<NFTToken[]> {
  const tokens: NFTToken[] = [];
  const contract = new Contract(contractAddress, ERC721_ABI, provider);

  try {
    const balance = await contract.balanceOf(ownerAddress);
    if (balance <= 0) return tokens;

    const name = await contract.name().catch(() => 'Unknown Collection');
    
    for (let i = 0; i < balance; i++) {
      try {
        const tokenId = await contract.tokenOfOwnerByIndex(ownerAddress, i);
        tokens.push({
          id: `${contractAddress}-${tokenId}`,
          name: `${name} #${tokenId}`,
          collection: name,
          imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400',
          contractAddress,
          tokenId: tokenId.toString(),
          chainId: 8453,
          standard: 'ERC721'
        });
      } catch (error) {
        console.warn(`Error fetching token ${i} from ${contractAddress}:`, error);
      }
    }
  } catch (error) {
    console.debug(`Contract ${contractAddress} is not ERC721`);
  }

  return tokens;
}