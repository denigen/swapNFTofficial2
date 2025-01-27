import { OPENSEA_CONFIG } from '../constants';
import { OpenSeaRequestConfig } from '../types';

export async function createOpenSeaRequest(
  url: string,
  config: OpenSeaRequestConfig = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 
    config.timeout || OPENSEA_CONFIG.REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...config,
      headers: {
        ...OPENSEA_CONFIG.DEFAULT_HEADERS,
        ...config.headers
      },
      signal: config.signal || controller.signal
    });

    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}