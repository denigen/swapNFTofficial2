import { NFTToken } from '../types/nft';
import { API_CONFIG, SUPPORTED_CHAINS } from '../config/api';

interface OpenSeaAsset {
  identifier: string;
  collection: string;
  contract: string;
  name: string;
  image_url: string;
  token_standard: 'ERC721' | 'ERC1155';
  balance?: string;
}

export async function fetchOpenSeaNFTs(
  ownerAddress: string,
  chainId: number
): Promise<NFTToken[]> {
  const isTestnet = chainId === SUPPORTED_CHAINS.SEPOLIA;
  const baseUrl = isTestnet ? API_CONFIG.OPENSEA.TESTNET_URL : API_CONFIG.OPENSEA.BASE_URL;
  
  try {
    const url = `${baseUrl}/chain/${getChainName(chainId)}/account/${ownerAddress}/nfts`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': API_CONFIG.OPENSEA.API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`OpenSea API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.nfts.map((asset: OpenSeaAsset) => ({
      id: `${asset.contract}-${asset.identifier}`,
      name: asset.name || `${asset.collection} #${asset.identifier}`,
      collection: asset.collection,
      imageUrl: asset.image_url,
      contractAddress: asset.contract,
      tokenId: asset.identifier,
      chainId,
      standard: asset.token_standard,
      balance: asset.token_standard === 'ERC1155' ? Number(asset.balance) : undefined
    }));
  } catch (error) {
    console.error('Error fetching from OpenSea:', error);
    return [];
  }
}

function getChainName(chainId: number): string {
  switch (chainId) {
    case SUPPORTED_CHAINS.MAINNET:
      return 'ethereum';
    case SUPPORTED_CHAINS.SEPOLIA:
      return 'sepolia';
    default:
      throw new Error(`Chain ID ${chainId} not supported by OpenSea`);
  }
}