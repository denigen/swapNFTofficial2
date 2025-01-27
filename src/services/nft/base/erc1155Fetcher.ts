import { JsonRpcProvider, Contract } from 'ethers';
import { NFTToken } from '../../../types/nft';
import { ERC1155_ABI } from '../../../config/contracts/abis';

export async function fetchERC1155Tokens(
  provider: JsonRpcProvider,
  contractAddress: string,
  ownerAddress: string
): Promise<NFTToken[]> {
  const tokens: NFTToken[] = [];
  const contract = new Contract(contractAddress, ERC1155_ABI, provider);

  try {
    const name = await contract.name().catch(() => 'Unknown Collection');
    
    // Check first few token IDs
    for (let tokenId = 0; tokenId < 10; tokenId++) {
      try {
        const balance = await contract.balanceOf(ownerAddress, tokenId);
        if (balance > 0) {
          tokens.push({
            id: `${contractAddress}-${tokenId}`,
            name: `${name} #${tokenId}`,
            collection: name,
            imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400',
            contractAddress,
            tokenId: tokenId.toString(),
            chainId: 8453,
            standard: 'ERC1155',
            balance: Number(balance)
          });
        }
      } catch {
        continue;
      }
    }
  } catch (error) {
    console.debug(`Contract ${contractAddress} is not ERC1155`);
  }

  return tokens;
}