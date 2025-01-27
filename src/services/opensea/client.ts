import { OPENSEA_CONFIG, CHAIN_NAMES } from './config';
import { OpenSeaRequestOptions, OpenSeaResponse } from './types';
import { retryWithBackoff } from '../../utils/retry';

class OpenSeaClient {
  private static instance: OpenSeaClient;
  private controller: AbortController;

  private constructor() {
    this.controller = new AbortController();
  }

  static getInstance(): OpenSeaClient {
    if (!OpenSeaClient.instance) {
      OpenSeaClient.instance = new OpenSeaClient();
    }
    return OpenSeaClient.instance;
  }

  async fetchNFTs(
    ownerAddress: string, 
    chainId: number,
    options: OpenSeaRequestOptions = {}
  ): Promise<OpenSeaResponse> {
    const chainName = CHAIN_NAMES[chainId];
    if (!chainName) {
      throw new Error(`Chain ${chainId} not supported by OpenSea`);
    }

    const url = `${OPENSEA_CONFIG.BASE_URL}/chain/${chainName}/account/${ownerAddress}/nfts`;
    
    try {
      return await retryWithBackoff(
        async () => {
          const response = await fetch(url, {
            headers: {
              'Accept': 'application/json',
              'X-API-KEY': OPENSEA_CONFIG.API_KEY
            },
            signal: options.signal || this.controller.signal,
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenSea API error: ${response.status} - ${errorText}`);
          }

          return await response.json();
        },
        options.retries || OPENSEA_CONFIG.MAX_RETRIES,
        OPENSEA_CONFIG.RETRY_DELAY,
        { maxDelay: 5000 }
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('OpenSea request cancelled');
      }
      throw error;
    }
  }

  cancelRequests() {
    this.controller.abort();
    this.controller = new AbortController();
  }
}

export const openSeaClient = OpenSeaClient.getInstance();