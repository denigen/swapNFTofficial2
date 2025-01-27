import { Contract } from 'ethers';
import { INTERFACE_IDS } from '../../../config/contracts/addresses/common';

export async function isERC721(contract: Contract): Promise<boolean> {
  try {
    return await contract.supportsInterface(INTERFACE_IDS.ERC721);
  } catch {
    return false;
  }
}

export async function isERC1155(contract: Contract): Promise<boolean> {
  try {
    return await contract.supportsInterface(INTERFACE_IDS.ERC1155);
  } catch {
    return false;
  }
}