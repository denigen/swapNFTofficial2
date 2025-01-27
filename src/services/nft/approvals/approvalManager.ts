import { Contract, JsonRpcSigner } from 'ethers';
import { ERC721_ABI } from '../../../config/contracts/abis';
import { retryWithBackoff } from '../../../utils/retry';

interface ApprovalResult {
  success: boolean;
  cancelled?: boolean;
  error?: string;
  txHash?: string;
}

export async function approveNFTContract(
  contractAddress: string,
  operatorAddress: string,
  signer: JsonRpcSigner
): Promise<ApprovalResult> {
  try {
    const address = await signer.getAddress();
    console.log(`Checking approval for ${contractAddress}`);

    const contract = new Contract(contractAddress, ERC721_ABI, signer);

    // Check current approval status
    const isApproved = await retryWithBackoff(
      () => contract.isApprovedForAll(address, operatorAddress),
      3,
      1000
    );

    if (isApproved) {
      console.log(`Contract ${contractAddress} already approved for ${operatorAddress}`);
      return { success: true };
    }

    // Set approval with explicit gas limit
    console.log(`Setting approval for ${contractAddress} to ${operatorAddress}`);
    let tx;
    try {
      tx = await contract.setApprovalForAll(operatorAddress, true, {
        gasLimit: 150000
      });
    } catch (error: any) {
      // Handle user rejection
      if (error.code === 4001 || error.message?.includes('user rejected')) {
        console.log('User cancelled approval transaction');
        return { success: false, cancelled: true };
      }
      throw error;
    }

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log(`Approval transaction confirmed: ${receipt.hash}`);
    
    // Verify approval was set
    const verifyApproval = await contract.isApprovedForAll(address, operatorAddress);
    if (!verifyApproval) {
      throw new Error('Approval verification failed');
    }

    return { 
      success: true,
      txHash: receipt.hash
    };
  } catch (error) {
    console.error('Error in approveNFTContract:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during approval'
    };
  }
}