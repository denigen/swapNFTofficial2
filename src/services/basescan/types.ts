export interface BaseScanResponse<T> {
  status: string;
  message: string;
  result: T;
}

export interface TokenTransferEvent {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  from: string;
  contractAddress: string;
  to: string;
  tokenID: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  transactionIndex: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  cumulativeGasUsed: string;
  confirmations: string;
}

export interface ContractABI {
  status: string;
  message: string;
  result: string;
}

export type BaseScanErrorCode = 
  | 'MAX_RATE_LIMIT_REACHED'
  | 'INVALID_API_KEY'
  | 'CONTRACT_NOT_FOUND'
  | 'INVALID_PARAMETERS';

export class BaseScanError extends Error {
  constructor(
    public code: BaseScanErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'BaseScanError';
  }
}