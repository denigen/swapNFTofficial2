import { NFTToken } from '../../../types/nft';
import { OPENSEA_CONFIG } from '../../../config/api/opensea';
import { OpenSeaResponse } from './types';
import { mapOpenSeaAssetToNFT } from './mapper';

export async function fetchOpenSeaNFTs(
  ownerAddress: string,
  chainId: number
): Promise<NFTToken[]> {
  if (!OPENSEA_CONFIG.CHAIN_NAMES[chainId]) {
    console.log(`Chain ${chainId} not supported by OpenSea`);
    return [];
  }

  try {
    const baseUrl = chainId === OPENSEA_CONFIG.SUPPORTED_CHAINS.SEPOLIA
      ? OPENSEA_CONFIG.TESTNET_URL
      : OPENSEA_CONFIG.BASE_URL;

    const chainName = OPENSEA_CONFIG.CHAIN_NAMES[chainId];
    const url = `${baseUrl}/chain/${chainName}/account/${ownerAddress}/nfts`;
    console.log(`Fetching from OpenSea: ${url}`);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': OPENSEA_CONFIG.API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`OpenSea API error: ${response.status} ${response.statusText}`);
    }

    const data: OpenSeaResponse = await response.json();
    if (!data.nfts?.length) {
      console.log('No NFTs found on OpenSea');
      return [];
    }

    const mappedNFTs = data.nfts.map(asset => mapOpenSeaAssetToNFT(asset, chainId));
    console.log(`Successfully mapped ${mappedNFTs.length} NFTs from OpenSea`);
    
    return mappedNFTs;
  } catch (error) {
    console.error('OpenSea fetch failed:', error);
    return [];
  }
}