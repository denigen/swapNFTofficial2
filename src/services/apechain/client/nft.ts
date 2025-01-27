import { ApeChainBaseClient } from './base';
import { NFTToken } from '../../../types/nft';
import { Contract } from 'ethers';
import { ERC721_ABI } from '../../../config/contracts/abis';
import { getProvider } from '../../../utils/providers/rpcProvider';
import { retryWithBackoff } from '../../../utils/retry';

export class ApeChainNFTClient extends ApeChainBaseClient {
  async getNFTs(address: string): Promise<NFTToken[]> {
    try {
      const provider = await getProvider(33139);
      const nftContract = new Contract(
        '0x0fb46e905e574ce11d44516a174b64b35855d3d8',
        ERC721_ABI,
        provider
      );

      // Get balance first
      const balance = await retryWithBackoff(
        () => nftContract.balanceOf(address),
        3,
        1000
      );

      if (balance <= 0) {
        return [];
      }

      console.log(`Found ${balance} NFTs for address ${address}`);

      // Fetch each token
      const tokens: NFTToken[] = [];
      for (let i = 0; i < balance; i++) {
        try {
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
          const owner = await nftContract.ownerOf(tokenId);

          if (owner.toLowerCase() === address.toLowerCase()) {
            tokens.push({
              id: `${nftContract.target}-${tokenId}`,
              name: `ApeChain NFT #${tokenId}`,
              collection: 'ApeChain Collection',
              imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400',
              contractAddress: nftContract.target,
              tokenId: tokenId.toString(),
              chainId: 33139,
              standard: 'ERC721'
            });
          }
        } catch (error) {
          console.warn(`Error fetching token ${i}:`, error);
        }
      }

      return tokens;
    } catch (error) {
      console.error('Error fetching ApeChain NFTs:', error);
      return [];
    }
  }
}

export const apeChainNFTClient = new ApeChainNFTClient();