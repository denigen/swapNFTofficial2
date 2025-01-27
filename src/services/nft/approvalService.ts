import { JsonRpcSigner } from 'ethers';
import { checkApproval, setApproval } from './contracts/approval';
import { NFTApprovalResult } from './types';
import { retryWithBackoff } from '../../utils/retry';

export async function approveNFTContract(
  contractAddress: string,
  operatorAddress: string,
  signer: JsonRpcSigner
): Promise<NFTApprovalResult> {
  try {
    const ownerAddress = await signer.getAddress();
    console.log(`Checking approval for ${contractAddress}`);

    // Check current approval status
    const isApproved = await checkApproval(
      contractAddress,
      ownerAddress,
      operatorAddress,
      signer
    );

    if (isApproved) {
      console.log(`Contract ${contractAddress} already approved for ${operatorAddress}`);
      return { success: true };
    }

    // Set approval
    console.log(`Setting approval for ${contractAddress} to ${operatorAddress}`);
    await setApproval(contractAddress, operatorAddress, signer);

    // Verify approval was set
    const verifyApproval = await checkApproval(
      contractAddress,
      ownerAddress,
      operatorAddress,
      signer
    );

    if (!verifyApproval) {
      throw new Error('Approval verification failed');
    }

    return { success: true };
  } catch (error) {
    console.error('Error in approveNFTContract:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during approval'
    };
  }
}