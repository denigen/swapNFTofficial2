import { MagicEdenBaseClient } from './base';
import { MAGICEDEN_ENDPOINTS } from '../config';

export interface CollectionStats {
  symbol: string;
  floorPrice: number;
  listedCount: number;
  volumeAll: number;
}

export class MagicEdenCollectionsClient extends MagicEdenBaseClient {
  async getCollectionStats(symbol: string): Promise<CollectionStats> {
    return this.fetchWithRetry(
      `${MAGICEDEN_ENDPOINTS.COLLECTIONS}/${symbol}/stats`
    );
  }

  async searchCollections(query: string) {
    return this.fetchWithRetry(
      `${MAGICEDEN_ENDPOINTS.COLLECTIONS}/search?q=${encodeURIComponent(query)}`
    );
  }
}

export const magicEdenCollectionsClient = new MagicEdenCollectionsClient();