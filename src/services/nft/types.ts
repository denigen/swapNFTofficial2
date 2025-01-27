export type NFTStandard = 'ERC721' | 'ERC1155';

export interface NFTApprovalResult {
  success: boolean;
  error?: string;
  txHash?: string;
}

export interface NFTContractInfo {
  standard: NFTStandard;
  isValid: boolean;
}