export const NFT_INTERFACE_IDS = {
  ERC721: '0x80ac58cd',
  ERC1155: '0xd9b67a26'
} as const;

export type NFTStandard = 'ERC721' | 'ERC1155';

export interface NFTContractInfo {
  standard: NFTStandard;
  isValid: boolean;
}