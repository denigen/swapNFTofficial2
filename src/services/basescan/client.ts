import { BASESCAN_CONFIG } from '../../config/api/basescan';
import { BaseScanResponse, BaseScanError } from './types';
import { retryWithBackoff } from '../../utils/retry';
import { RateLimiter } from './utils/rateLimiter';

export class BaseScanClient {
  private static instance: BaseScanClient;
  private rateLimiter: RateLimiter;

  private constructor() {
    this.rateLimiter = new RateLimiter(
      BASESCAN_CONFIG.RATE_LIMIT.CALLS_PER_SECOND,
      1000
    );
  }

  static getInstance(): BaseScanClient {
    if (!BaseScanClient.instance) {
      BaseScanClient.instance = new BaseScanClient();
    }
    return BaseScanClient.instance;
  }

  async fetch<T>(endpoint: string, params: Record<string, string>): Promise<T> {
    await this.rateLimiter.acquire();

    try {
      const url = this.buildUrl(endpoint, params);
      
      const response = await retryWithBackoff(
        async () => {
          const res = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            },
            signal: AbortSignal.timeout(BASESCAN_CONFIG.TIMEOUT)
          });

          if (!res.ok) {
            throw new BaseScanError(
              'INVALID_PARAMETERS',
              `HTTP error! status: ${res.status}`
            );
          }

          return res.json();
        },
        BASESCAN_CONFIG.MAX_RETRIES,
        BASESCAN_CONFIG.RETRY_DELAY
      );

      const data = response as BaseScanResponse<T>;

      if (data.status === '0') {
        throw this.handleError(data.message);
      }

      return data.result;
    } finally {
      this.rateLimiter.release();
    }
  }

  private buildUrl(endpoint: string, params: Record<string, string>): string {
    const queryParams = new URLSearchParams({
      apikey: BASESCAN_CONFIG.API_KEY,
      ...params
    });

    return `${BASESCAN_CONFIG.BASE_URL}?${queryParams.toString()}&module=${endpoint}`;
  }

  private handleError(message: string): BaseScanError {
    if (message.includes('rate limit')) {
      return new BaseScanError('MAX_RATE_LIMIT_REACHED', message);
    }
    if (message.includes('invalid api key')) {
      return new BaseScanError('INVALID_API_KEY', message);
    }
    if (message.includes('not found')) {
      return new BaseScanError('CONTRACT_NOT_FOUND', message);
    }
    return new BaseScanError('INVALID_PARAMETERS', message);
  }
}