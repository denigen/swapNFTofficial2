export * from './api/tokenApi';
export * from './api/contractApi';
export * from './types';

import { TokenAPI } from './api/tokenApi';
import { ContractAPI } from './api/contractApi';

export const basescan = {
  token: new TokenAPI(),
  contract: new ContractAPI()
};