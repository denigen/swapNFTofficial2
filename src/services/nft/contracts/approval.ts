import { Contract, JsonRpcSigner } from 'ethers';
import { ERC721_ABI, ERC1155_ABI } from '../../../config/contracts/abis';
import { detectNFTStandard } from './detection';
import { retryWithBackoff } from '../../../utils/retry';

export async function checkApproval(
  contractAddress: string,
  ownerAddress: string,
  operatorAddress: string,
  signer: JsonRpcSigner
): Promise<boolean> {
  const contract = new Contract(contractAddress, ERC721_ABI, signer);
  const standard = await detectNFTStandard(contract);

  if (!standard) {
    throw new Error('Unsupported NFT standard');
  }

  const abi = standard === 'ERC721' ? ERC721_ABI : ERC1155_ABI;
  const nftContract = new Contract(contractAddress, abi, signer);

  return retryWithBackoff(
    () => nftContract.isApprovedForAll(ownerAddress, operatorAddress),
    3,
    1000
  );
}

export async function setApproval(
  contractAddress: string,
  operatorAddress: string,
  signer: JsonRpcSigner
): Promise<boolean> {
  const contract = new Contract(contractAddress, ERC721_ABI, signer);
  const standard = await detectNFTStandard(contract);

  if (!standard) {
    throw new Error('Unsupported NFT standard');
  }

  const abi = standard === 'ERC721' ? ERC721_ABI : ERC1155_ABI;
  const nftContract = new Contract(contractAddress, abi, signer);

  try {
    const tx = await retryWithBackoff(
      () => nftContract.setApprovalForAll(operatorAddress, true, {
        gasLimit: 100000
      }),
      3,
      1000
    );

    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error setting approval:', error);
    throw error;
  }
}