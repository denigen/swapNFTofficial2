import { Contract } from 'ethers';
import { getProvider } from '../../utils/providers/rpcProvider';
import { ERC721_ABI } from '../../config/contracts/abis';
import { KNOWN_NFT_CONTRACTS } from '../../config/contracts/addresses';

export async function getContractInstance(
  contractAddress: string,
  chainId: number
): Promise<Contract> {
  const provider = await getProvider(chainId);
  return new Contract(contractAddress, ERC721_ABI, provider);
}

export function getKnownContracts(chainId: number): string[] {
  return KNOWN_NFT_CONTRACTS[chainId] || [];
}

export async function isValidNFTContract(
  contractAddress: string,
  chainId: number
): Promise<boolean> {
  try {
    const contract = await getContractInstance(contractAddress, chainId);
    await contract.supportsInterface('0x80ac58cd'); // ERC721 interface ID
    return true;
  } catch {
    return false;
  }
}