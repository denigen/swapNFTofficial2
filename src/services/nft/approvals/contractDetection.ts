import { Contract } from 'ethers';
import { NFT_INTERFACE_IDS, NFTContractInfo } from './contractTypes';
import { retryWithBackoff } from '../../../utils/retry';

export async function detectNFTContractType(contract: Contract): Promise<NFTContractInfo> {
  try {
    // Check ERC721 first with retry
    const isERC721 = await retryWithBackoff(
      () => contract.supportsInterface(NFT_INTERFACE_IDS.ERC721),
      3,
      1000
    ).catch(() => false);
    
    if (isERC721) {
      return { standard: 'ERC721', isValid: true };
    }

    // Check ERC1155 with retry
    const isERC1155 = await retryWithBackoff(
      () => contract.supportsInterface(NFT_INTERFACE_IDS.ERC1155),
      3,
      1000
    ).catch(() => false);
    
    if (isERC1155) {
      return { standard: 'ERC1155', isValid: true };
    }

    return { standard: 'ERC721', isValid: false };
  } catch (error) {
    console.error('Error detecting NFT contract type:', error);
    return { standard: 'ERC721', isValid: false };
  }
}