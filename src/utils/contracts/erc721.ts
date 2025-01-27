import { Contract } from 'ethers';

export const ERC721_INTERFACE_ID = '0x80ac58cd';

export const ERC721_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function supportsInterface(bytes4 interfaceId) view returns (bool)',
  'function ownerOf(uint256 tokenId) view returns (address)'
];

export async function isERC721Contract(contract: Contract): Promise<boolean> {
  try {
    return await contract.supportsInterface(ERC721_INTERFACE_ID);
  } catch {
    return false;
  }
}