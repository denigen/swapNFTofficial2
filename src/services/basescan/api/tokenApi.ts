import { BaseScanClient } from '../client';
import { TokenTransferEvent } from '../types';
import { BASESCAN_ENDPOINTS } from '../../../config/api/basescan';

export class TokenAPI {
  private client: BaseScanClient;

  constructor() {
    this.client = BaseScanClient.getInstance();
  }

  async getTokenTransfers(
    contractAddress: string,
    fromBlock?: number,
    toBlock?: number
  ): Promise<TokenTransferEvent[]> {
    const params: Record<string, string> = {
      action: 'tokentx',
      contractaddress: contractAddress,
      sort: 'desc'
    };

    if (fromBlock) params.startblock = fromBlock.toString();
    if (toBlock) params.endblock = toBlock.toString();

    return this.client.fetch<TokenTransferEvent[]>(
      BASESCAN_ENDPOINTS.TOKEN,
      params
    );
  }

  async getNFTTransfers(
    contractAddress: string,
    tokenId: string
  ): Promise<TokenTransferEvent[]> {
    return this.client.fetch<TokenTransferEvent[]>(
      BASESCAN_ENDPOINTS.TOKEN,
      {
        action: 'tokennfttx',
        contractaddress: contractAddress,
        tokenid: tokenId,
        sort: 'desc'
      }
    );
  }
}