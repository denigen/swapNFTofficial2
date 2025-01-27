import { Contract } from 'ethers';
import { NFTToken } from '../types/nft';
import { KNOWN_NFT_CONTRACTS } from '../config/contracts/addresses';
import { ERC721_ABI } from '../config/contracts/abis';
import { getProvider } from '../utils/providers/rpcProvider';

export async function fetchWalletNFTs(
  walletAddress: string,
  chainId: number
): Promise<NFTToken[]> {
  if (!walletAddress || !chainId) {
    console.log('Missing wallet address or chain ID');
    return [];
  }

  try {
    console.log(`Fetching NFTs for wallet ${walletAddress} on chain ${chainId}`);
    const provider = await getProvider(chainId);
    const tokens: NFTToken[] = [];

    // Get known contract addresses for this chain
    const contractAddresses = KNOWN_NFT_CONTRACTS[chainId] || [];
    console.log('Known contract addresses:', contractAddresses);

    for (const contractAddress of contractAddresses) {
      try {
        const contract = new Contract(contractAddress, ERC721_ABI, provider);
        
        // Get balance
        const balance = await contract.balanceOf(walletAddress);
        console.log(`Balance for contract ${contractAddress}:`, balance.toString());

        if (balance > 0) {
          const name = await contract.name().catch(() => 'Unknown Collection');
          
          // Fetch each token
          for (let i = 0; i < balance; i++) {
            try {
              const tokenId = await contract.tokenOfOwnerByIndex(walletAddress, i);
              console.log(`Found token ${tokenId} in contract ${contractAddress}`);
              
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
            } catch (err) {
              console.warn(`Error fetching token ${i} from ${contractAddress}:`, err);
            }
          }
        }
      } catch (err) {
        console.warn(`Error processing contract ${contractAddress}:`, err);
      }
    }

    console.log(`Total tokens found: ${tokens.length}`);
    return tokens;
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return [];
  }
}