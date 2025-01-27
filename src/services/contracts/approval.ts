import { Contract, JsonRpcSigner } from 'ethers';
import { ERC721_ABI } from '../../config/contracts/abis/erc721';
import { ApprovalResult } from './types';
import { retryWithBackoff } from '../../utils/retry';

export async function checkApproval(
  contractAddress: string,
  ownerAddress: string,
  operatorAddress: string,
  signer: JsonRpcSigner
): Promise<boolean> {
  const contract = new Contract(contractAddress, ERC721_ABI, signer);
  return contract.isApprovedForAll(ownerAddress, operatorAddress);
}

export async function setApproval(
  contractAddress: string,
  operatorAddress: string,
  signer: JsonRpcSigner
): Promise<ApprovalResult> {
  try {
    const contract = new Contract(contractAddress, ERC721_ABI, signer);
    
    const tx = await retryWithBackoff(
      () => contract.setApprovalForAll(operatorAddress, true, {
        gasLimit: 100000
      }),
      3,
      1000
    );

    await tx.wait();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during approval'
    };
  }
}