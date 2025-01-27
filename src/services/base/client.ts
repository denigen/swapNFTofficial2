import { BASE_API_CONFIG } from '../../config/api/base';
import { retryWithBackoff } from '../../utils/retry';

class BaseAPIClient {
  private static instance: BaseAPIClient;
  private lastRequestTime: number = 0;

  private constructor() {}

  static getInstance(): BaseAPIClient {
    if (!BaseAPIClient.instance) {
      BaseAPIClient.instance = new BaseAPIClient();
    }
    return BaseAPIClient.instance;
  }

  async fetch<T>(endpoint: string, params: Record<string, string>): Promise<T> {
    await this.rateLimit();

    const url = this.buildUrl(endpoint, params);

    try {
      const response = await retryWithBackoff(
        async () => {
          const res = await fetch(url, {
            headers: {
              'Accept': 'application/json'
            }
          });

          if (!res.ok) {
            throw new Error(`BASE API error: ${res.status}`);
          }

          return res.json();
        },
        3,
        1000
      );

      return response.result;
    } catch (error) {
      console.error('BASE API request failed:', error);
      throw error;
    }
  }

  private buildUrl(endpoint: string, params: Record<string, string>): string {
    const queryParams = new URLSearchParams({
      apikey: BASE_API_CONFIG.API_KEY,
      ...params
    });

    return `${BASE_API_CONFIG.BASE_URL}/${endpoint}?${queryParams.toString()}`;
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = 1000 / BASE_API_CONFIG.RATE_LIMITS.REQUESTS_PER_SECOND;

    if (timeSinceLastRequest < minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, minInterval - timeSinceLastRequest)
      );
    }

    this.lastRequestTime = Date.now();
  }
}

export const baseClient = BaseAPIClient.getInstance();