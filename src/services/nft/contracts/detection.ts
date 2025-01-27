import { Contract } from 'ethers';
import { NFTStandard } from '../types';
import { retryWithBackoff } from '../../../utils/retry';

const INTERFACE_IDS = {
  ERC721: '0x80ac58cd',
  ERC1155: '0xd9b67a26'
} as const;

export async function detectNFTStandard(contract: Contract): Promise<NFTStandard | null> {
  try {
    // Check ERC721
    const isERC721 = await retryWithBackoff(
      () => contract.supportsInterface(INTERFACE_IDS.ERC721),
      3,
      1000
    ).catch(() => false);

    if (isERC721) return 'ERC721';

    // Check ERC1155
    const isERC1155 = await retryWithBackoff(
      () => contract.supportsInterface(INTERFACE_IDS.ERC1155),
      3,
      1000
    ).catch(() => false);

    if (isERC1155) return 'ERC1155';

    return null;
  } catch (error) {
    console.error('Error detecting NFT standard:', error);
    return null;
  }
}