import { Contract } from 'ethers';
import { TEST_NFTS, NFT_ABI } from '../config/contracts';

export async function mintTestNFT(signer: any, chainId: number) {
  try {
    // Get test NFT contract addresses for the current chain
    const testNFTs = TEST_NFTS[chainId];
    if (!testNFTs || testNFTs.length === 0) {
      throw new Error('No test NFT contracts available on this network');
    }

    // Use the first test NFT contract
    const nftContract = new Contract(testNFTs[0], NFT_ABI, signer);
    const address = await signer.getAddress();

    // Mint NFT
    const tx = await nftContract.mint(address);
    const receipt = await tx.wait();

    // Get the minted token ID from events
    const mintEvent = receipt.logs[0];
    const tokenId = mintEvent.args[2]; // Transfer event: from, to, tokenId

    return {
      success: true,
      tokenId: tokenId.toString(),
      txHash: receipt.hash
    };
  } catch (error) {
    console.error('Error minting NFT:', error);
    throw error;
  }
}