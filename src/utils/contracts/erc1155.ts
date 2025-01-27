import { Contract } from 'ethers';

export const ERC1155_INTERFACE_ID = '0xd9b67a26';

export const ERC1155_ABI = [
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])',
  'function uri(uint256 id) view returns (string)',
  'function supportsInterface(bytes4 interfaceId) view returns (bool)',
  // Optional but common
  'function name() view returns (string)',
  'function symbol() view returns (string)'
];

export async function isERC1155Contract(contract: Contract): Promise<boolean> {
  try {
    return await contract.supportsInterface(ERC1155_INTERFACE_ID);
  } catch {
    return false;
  }
}

export async function getERC1155TokenBalance(
  contract: Contract,
  account: string,
  tokenId: string
): Promise<number> {
  try {
    const balance = await contract.balanceOf(account, tokenId);
    return Number(balance);
  } catch (error) {
    console.error('Error getting ERC1155 balance:', error);
    return 0;
  }
}