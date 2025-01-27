import { Contract } from 'ethers';

export async function getContractMetadata(contract: Contract) {
  try {
    const [name, symbol] = await Promise.all([
      contract.name().catch(() => 'Unknown Collection'),
      contract.symbol().catch(() => 'NFT')
    ]);

    return { name, symbol };
  } catch (error) {
    console.error('Error fetching contract metadata:', error);
    return { name: 'Unknown Collection', symbol: 'NFT' };
  }
}