import { Contract } from 'ethers';
import { NFTToken } from '../../types/nft';
import { getProvider } from '../providers/rpcProvider';
import { ERC721_ABI, ERC1155_ABI } from '../../config/contracts/abis';
import { KNOWN_NFT_CONTRACTS } from '../../config/contracts/addresses';

export async function fetchAllNFTs(
  ownerAddress: string,
  chainId: number
): Promise<NFTToken[]> {
  if (!ownerAddress || !chainId) return [];

  try {
    const provider = await getProvider(chainId);
    const knownContracts = KNOWN_NFT_CONTRACTS[chainId] || [];
    const tokens: NFTToken[] = [];

    console.log('Checking known contracts:', knownContracts);

    for (const contractAddress of knownContracts) {
      try {
        console.log('Fetching tokens for contract:', contractAddress);
        const contractTokens = await fetchTokensForContract(
          contractAddress,
          ownerAddress,
          chainId
        );
        tokens.push(...contractTokens);
      } catch (error) {
        console.warn(`Error fetching tokens for contract ${contractAddress}:`, error);
      }
    }

    console.log(`Found ${tokens.length} NFTs on chain ${chainId}`);
    return tokens;
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return [];
  }
}

async function fetchTokensForContract(
  contractAddress: string,
  ownerAddress: string,
  chainId: number
): Promise<NFTToken[]> {
  const provider = await getProvider(chainId);
  const tokens: NFTToken[] = [];

  try {
    // Try as ERC721
    const erc721Contract = new Contract(contractAddress, ERC721_ABI, provider);
    const balance = await erc721Contract.balanceOf(ownerAddress);
    
    if (balance > 0) {
      const name = await erc721Contract.name().catch(() => 'Unknown Collection');
      
      for (let i = 0; i < balance; i++) {
        try {
          const tokenId = await erc721Contract.tokenOfOwnerByIndex(ownerAddress, i);
          tokens.push({
            id: `${contractAddress}-${tokenId}`,
            name: `${name} #${tokenId}`,
            collection: name,
            imageUrl: '', // We're not using images anymore
            contractAddress,
            tokenId: tokenId.toString(),
            chainId,
            standard: 'ERC721'
          });
        } catch (error) {
          console.warn(`Error fetching token ${i} from ${contractAddress}:`, error);
        }
      }
    }
  } catch (error) {
    // Try as ERC1155
    try {
      const erc1155Contract = new Contract(contractAddress, ERC1155_ABI, provider);
      const name = await erc1155Contract.name().catch(() => 'Unknown Collection');
      
      // Check first 100 token IDs
      for (let tokenId = 0; tokenId < 100; tokenId++) {
        try {
          const balance = await erc1155Contract.balanceOf(ownerAddress, tokenId);
          if (balance > 0) {
            tokens.push({
              id: `${contractAddress}-${tokenId}`,
              name: `${name} #${tokenId}`,
              collection: name,
              imageUrl: '', // We're not using images anymore
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
      console.warn('Contract does not implement ERC721 or ERC1155 interface');
    }
  }

  return tokens;
}