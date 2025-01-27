import { MAGICEDEN_CONFIG } from '../config';
import { MagicEdenError } from '../utils/error';
import { retryWithBackoff } from '../../../utils/retry';

export class MagicEdenBaseClient {
  protected async fetchWithRetry<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${MAGICEDEN_CONFIG.BASE_URL}${endpoint}`;
    
    return retryWithBackoff(
      async () => {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${MAGICEDEN_CONFIG.API_KEY}`,
            ...options.headers
          }
        });

        if (!response.ok) {
          const error = await response.text();
          throw new MagicEdenError(
            `API request failed: ${error}`,
            response.status
          );
        }

        return response.json();
      },
      MAGICEDEN_CONFIG.MAX_RETRIES,
      MAGICEDEN_CONFIG.RETRY_DELAY
    );
  }
}