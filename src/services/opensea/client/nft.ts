import { OpenSeaBaseClient } from './base';
import { OpenSeaRequestOptions, OpenSeaResponse } from '../types';
import { OPENSEA_CONFIG, CHAIN_NAMES } from '../constants';
import { validateChainId, validateAddress } from '../utils';
import { OPENSEA_ENDPOINTS } from '../constants/endpoints';

export class OpenSeaNFTClient extends OpenSeaBaseClient {
  private static instance: OpenSeaNFTClient;

  private constructor() {
    super();
  }

  static getInstance(): OpenSeaNFTClient {
    if (!OpenSeaNFTClient.instance) {
      OpenSeaNFTClient.instance = new OpenSeaNFTClient();
    }
    return OpenSeaNFTClient.instance;
  }

  async fetchNFTs(
    ownerAddress: string, 
    chainId: number,
    options: OpenSeaRequestOptions = {}
  ): Promise<OpenSeaResponse> {
    validateChainId(chainId);
    validateAddress(ownerAddress);

    const chainName = CHAIN_NAMES[chainId];
    const endpoint = OPENSEA_ENDPOINTS.ACCOUNT_NFTS(chainName, ownerAddress);
    const url = `${OPENSEA_CONFIG.BASE_URL}${endpoint}`;

    return this.fetchWithRetry(url, options);
  }
}

export const openSeaClient = OpenSeaNFTClient.getInstance();