import { OPENSEA_CONFIG } from '../constants';
import { OpenSeaRequestOptions, OpenSeaResponse } from '../types';
import { validateChainId, validateAddress, OpenSeaError } from '../utils';
import { createOpenSeaRequest } from '../utils/request';
import { retryWithBackoff } from '../../../utils/retry';

export class OpenSeaBaseClient {
  protected controller: AbortController;

  constructor() {
    this.controller = new AbortController();
  }

  protected async fetchWithRetry(
    url: string,
    options: OpenSeaRequestOptions = {}
  ): Promise<OpenSeaResponse> {
    try {
      return await retryWithBackoff(
        async () => {
          const response = await createOpenSeaRequest(url, {
            signal: options.signal || this.controller.signal,
            timeout: options.timeout
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw OpenSeaError.fromResponse(response, errorText);
          }

          const data = await response.json();
          return this.validateResponse(data);
        },
        options.retries || OPENSEA_CONFIG.MAX_RETRIES,
        OPENSEA_CONFIG.RETRY_DELAY,
        { maxDelay: 5000 }
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new OpenSeaError('Request cancelled', 499);
      }
      throw error;
    }
  }

  protected validateResponse(data: unknown): OpenSeaResponse {
    if (!data || typeof data !== 'object' || !('nfts' in data)) {
      throw new OpenSeaError('Invalid response format', 500);
    }
    return data as OpenSeaResponse;
  }

  public cancelRequests(): void {
    this.controller.abort();
    this.controller = new AbortController();
  }
}