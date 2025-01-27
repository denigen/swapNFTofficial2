import { JsonRpcProvider } from 'ethers';
import { TRANSFER_TOPICS } from './constants';
import { getNetworkConfig } from '../../../config/networks';

export async function scanForNFTContracts(
  provider: JsonRpcProvider,
  address: string,
  chainId: number
): Promise<string[]> {
  const config = getNetworkConfig(chainId);
  if (!config) {
    throw new Error(`No configuration found for chain ${chainId}`);
  }

  const contracts = new Set<string>();
  const latestBlock = await provider.getBlockNumber();
  const fromBlock = Math.max(latestBlock - 10000, config.startBlock); // Last 10000 blocks
  const paddedAddress = '0x000000000000000000000000' + address.slice(2).toLowerCase();

  try {
    const logs = await provider.getLogs({
      fromBlock,
      toBlock: latestBlock,
      topics: [
        [TRANSFER_TOPICS.ERC721, TRANSFER_TOPICS.ERC1155_SINGLE, TRANSFER_TOPICS.ERC1155_BATCH],
        null,
        paddedAddress
      ]
    });

    logs.forEach(log => contracts.add(log.address.toLowerCase()));
    console.log(`Found ${contracts.size} NFT contracts for address ${address}`);
    
    return Array.from(contracts);
  } catch (error) {
    console.error('Error scanning for NFT contracts:', error);
    throw error;
  }
}