import { JsonRpcProvider } from 'ethers';
import { KNOWN_BASE_CONTRACTS, BASE_SCAN_CONFIG } from './constants';
import { retryWithBackoff } from '../../../utils/retry';

export async function getBaseContracts(
  provider: JsonRpcProvider,
  address: string
): Promise<string[]> {
  try {
    const contracts = new Set<string>();
    
    // Add known contracts first
    KNOWN_BASE_CONTRACTS.forEach(contract => 
      contracts.add(contract.toLowerCase())
    );

    // Get latest block with retry
    const latestBlock = await retryWithBackoff(
      () => provider.getBlockNumber(),
      3,
      1000
    );

    // Calculate block range
    const fromBlock = Math.max(
      latestBlock - BASE_SCAN_CONFIG.MAX_BLOCKS_PER_SCAN,
      BASE_SCAN_CONFIG.START_BLOCK
    );

    // Scan for contracts in smaller chunks
    const chunkSize = 2000;
    const paddedAddress = '0x000000000000000000000000' + address.slice(2).toLowerCase();

    for (let startBlock = fromBlock; startBlock <= latestBlock; startBlock += chunkSize) {
      const endBlock = Math.min(startBlock + chunkSize - 1, latestBlock);
      
      try {
        const logs = await retryWithBackoff(
          () => provider.getLogs({
            fromBlock: startBlock,
            toBlock: endBlock,
            topics: [
              [
                BASE_SCAN_CONFIG.TRANSFER_TOPICS.ERC721,
                BASE_SCAN_CONFIG.TRANSFER_TOPICS.ERC1155_SINGLE,
                BASE_SCAN_CONFIG.TRANSFER_TOPICS.ERC1155_BATCH
              ],
              null,
              paddedAddress
            ]
          }),
          2,
          500
        );

        logs.forEach(log => contracts.add(log.address.toLowerCase()));

        // Add delay between chunks
        if (startBlock + chunkSize <= latestBlock) {
          await new Promise(resolve => setTimeout(resolve, BASE_SCAN_CONFIG.REQUEST_DELAY));
        }
      } catch (error) {
        console.warn(`Error scanning blocks ${startBlock}-${endBlock}:`, error);
        continue;
      }
    }

    const discoveredContracts = Array.from(contracts);
    console.log(`Found ${discoveredContracts.length} NFT contracts on BASE`);
    return discoveredContracts;
  } catch (error) {
    console.error('Error discovering BASE contracts:', error);
    throw error;
  }
}