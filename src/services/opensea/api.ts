import { OPENSEA_CONFIG } from '../../config/api/opensea';
import { retryWithBackoff } from '../../utils/retry';

class OpenSeaAPI {
  private static instance: OpenSeaAPI;
  private readonly baseUrl: string;
  private readonly apiKey: string;

  private constructor() {
    this.apiKey = OPENSEA_CONFIG.API_KEY;
    this.baseUrl = OPENSEA_CONFIG.BASE_URL;
  }

  static getInstance(): OpenSeaAPI {
    if (!OpenSeaAPI.instance) {
      OpenSeaAPI.instance = new OpenSeaAPI();
    }
    return OpenSeaAPI.instance;
  }

  async fetchNFTs(ownerAddress: string, chainId: number) {
    const chainName = this.getChainName(chainId);
    if (!chainName) {
      console.log(`Chain ${chainId} not supported by OpenSea`);
      return { nfts: [] };
    }

    const url = `${this.baseUrl}/chain/${chainName}/account/${ownerAddress}/nfts`;
    console.log('Fetching from OpenSea:', url);

    try {
      const response = await retryWithBackoff(
        async () => {
          const res = await fetch(url, {
            headers: {
              'Accept': 'application/json',
              'X-API-KEY': this.apiKey
            }
          });

          if (!res.ok) {
            throw new Error(`OpenSea API error: ${res.status} ${res.statusText}`);
          }

          return res.json();
        },
        3,
        1000,
        { maxDelay: 5000 }
      );

      return response;
    } catch (error) {
      console.error('OpenSea API request failed:', error);
      throw error;
    }
  }

  private getChainName(chainId: number): string | null {
    const chainNames: Record<number, string> = {
      1: 'ethereum',
      11155111: 'sepolia',
      8453: 'base'
    };
    return chainNames[chainId] || null;
  }
}

export const openSeaAPI = OpenSeaAPI.getInstance();