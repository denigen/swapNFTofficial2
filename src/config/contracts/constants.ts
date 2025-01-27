import { CHAIN_IDS } from '../chains/constants';

export const CONTRACT_ADDRESSES = {
  [CHAIN_IDS.BASE]: {
    NFT_SWAP: '0x553020d1902bDe2F71ae9eeA828F41492127D716'
  }
} as const;

export const INTERFACE_IDS = {
  ERC721: '0x80ac58cd',
  ERC1155: '0xd9b67a26'
} as const;