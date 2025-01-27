import { APECHAIN_API_CONFIG } from '../config';
import { ApeChainError } from '../utils/error';
import { retryWithBackoff } from '../../../utils/retry';

export class ApeChainBaseClient {
  protected ws: WebSocket | null = null;
  protected requestId = 0;

  protected async connect(): Promise<WebSocket> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return this.ws;
    }

    return new Promise((resolve, reject) => {
      const ws = new WebSocket(APECHAIN_API_CONFIG.BASE_URL);
      
      const timeout = setTimeout(() => {
        ws.close();
        reject(new ApeChainError('Connection timeout', 408));
      }, APECHAIN_API_CONFIG.REQUEST_TIMEOUT);

      ws.onopen = () => {
        clearTimeout(timeout);
        this.ws = ws;
        resolve(ws);
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        reject(new ApeChainError('Connection failed', 500));
      };
    });
  }

  protected async sendRequest<T>(method: string, params: any): Promise<T> {
    return retryWithBackoff(
      async () => {
        const ws = await this.connect();
        
        return new Promise((resolve, reject) => {
          const id = ++this.requestId;
          const request = {
            jsonrpc: '2.0',
            id,
            method,
            params,
            auth: APECHAIN_API_CONFIG.API_KEY
          };

          const timeout = setTimeout(() => {
            reject(new ApeChainError('Request timeout', 408));
          }, APECHAIN_API_CONFIG.REQUEST_TIMEOUT);

          const handleMessage = (event: MessageEvent) => {
            const response = JSON.parse(event.data);
            if (response.id === id) {
              ws.removeEventListener('message', handleMessage);
              clearTimeout(timeout);
              
              if (response.error) {
                reject(new ApeChainError(response.error.message, response.error.code));
              } else {
                resolve(response.result);
              }
            }
          };

          ws.addEventListener('message', handleMessage);
          ws.send(JSON.stringify(request));
        });
      },
      APECHAIN_API_CONFIG.MAX_RETRIES,
      APECHAIN_API_CONFIG.RETRY_DELAY
    );
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}