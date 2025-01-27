import { NFTToken } from '../../../types/nft';
import { Contract } from 'ethers';
import { ERC721_ABI } from '../../../config/contracts/abis';
import { getProvider } from '../../../utils/providers/rpcProvider';
import { retryWithBackoff } from '../../../utils/retry';
import { APECHAIN_CONTRACTS } from '../../../config/contracts/addresses/apechain';

export async function fetchApeChainNFTs(
  ownerAddress: string,
  chainId: number
): Promise<NFTToken[]> {
  if (chainId !== 33139) return [];

  try {
    console.log('Starting ApeChain NFT fetch...');
    const provider = await getProvider(chainId);
    const tokens: NFTToken[] = [];

    // Get known NFT contracts
    const contracts = APECHAIN_CONTRACTS.KNOWN_NFTS;
    console.log('Checking ApeChain contracts:', contracts);

    for (const contractAddress of contracts) {
      try {
        const contract = new Contract(contractAddress, ERC721_ABI, provider);
        
        // Get balance with retry
        const balance = await retryWithBackoff(
          () => contract.balanceOf(ownerAddress),
          3,
          1000
        );

        if (balance > 0) {
          console.log(`Found ${balance} tokens in contract ${contractAddress}`);
          const name = await contract.name().catch(() => 'ApeChain NFT');
          
          // Fetch each token
          for (let i = 0; i < Number(balance); i++) {
            try {
              const tokenId = await retryWithBackoff(
                () => contract.tokenOfOwnerByIndex(ownerAddress, i),
                3,
                1000
              );

              tokens.push({
                id: `${contractAddress}-${tokenId}`,
                name: `${name} #${tokenId}`,
                collection: name,
                imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400',
                contractAddress,
                tokenId: tokenId.toString(),
                chainId,
                standard: 'ERC721'
              });
              console.log(`Found token ${tokenId} for ${ownerAddress}`);
            } catch (error) {
              console.warn(`Error fetching token ${i} from ${contractAddress}:`, error);
            }
          }
        }
      } catch (error) {
        console.warn(`Error processing ApeChain contract ${contractAddress}:`, error);
      }

      // Add delay between contract checks
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`Found ${tokens.length} total NFTs on ApeChain`);
    return tokens;
  } catch (error) {
    console.error('Error fetching ApeChain NFTs:', error);
    return [];
  }
}