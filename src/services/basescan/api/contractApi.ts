import { BaseScanClient } from '../client';
import { ContractABI } from '../types';
import { BASESCAN_ENDPOINTS } from '../../../config/api/basescan';

export class ContractAPI {
  private client: BaseScanClient;

  constructor() {
    this.client = BaseScanClient.getInstance();
  }

  async getContractABI(address: string): Promise<string> {
    return this.client.fetch<ContractABI>(
      BASESCAN_ENDPOINTS.CONTRACT,
      {
        action: 'getabi',
        address
      }
    );
  }

  async getContractSourceCode(address: string): Promise<string> {
    return this.client.fetch<string>(
      BASESCAN_ENDPOINTS.CONTRACT,
      {
        action: 'getsourcecode',
        address
      }
    );
  }
}