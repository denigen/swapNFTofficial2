import { JsonRpcSigner, Contract } from 'ethers';
import { ERC721_ABI } from '../../config/contracts/abis/erc721';
import { retryWithBackoff } from '../../utils/retry';

export async function approveNFTContract(
  contractAddress: string,
  operatorAddress: string,
  signer: JsonRpcSigner
): Promise<void> {
  try {
    const contract = new Contract(contractAddress, ERC721_ABI, signer);
    const ownerAddress = await signer.getAddress();

    // Check current approval status with retry
    const isApproved = await retryWithBackoff(
      () => contract.isApprovedForAll(ownerAddress, operatorAddress),
      3,
      1000
    );

    if (!isApproved) {
      // Set approval with retry
      const tx = await retryWithBackoff(
        () => contract.setApprovalForAll(operatorAddress, true, {
          gasLimit: 100000
        }),
        3,
        1000
      );

      await tx.wait();
    }
  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? `Approval failed: ${error.message}`
        : 'Unknown error during approval'
    );
  }
}