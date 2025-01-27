import { JsonRpcProvider, Log } from 'ethers';
import { NFT_TRANSFER_TOPICS } from './eventTopics';

export async function fetchTransferLogs(
  provider: JsonRpcProvider,
  fromBlock: number,
  toBlock: number,
  address: string
): Promise<Log[]> {
  const paddedAddress = '0x000000000000000000000000' + address.slice(2).toLowerCase();

  try {
    const logs = await provider.getLogs({
      fromBlock,
      toBlock,
      topics: [
        [
          NFT_TRANSFER_TOPICS.ERC721,
          NFT_TRANSFER_TOPICS.ERC1155_SINGLE,
          NFT_TRANSFER_TOPICS.ERC1155_BATCH
        ],
        null,
        paddedAddress
      ]
    });

    console.log(`Retrieved ${logs.length} transfer logs for blocks ${fromBlock}-${toBlock}`);
    return logs;
  } catch (error) {
    // Handle RPC-specific errors
    if (error instanceof Error) {
      if (error.message.includes('block range')) {
        console.warn('Block range too large, reducing batch size');
        // Try again with smaller range
        const midBlock = Math.floor((fromBlock + toBlock) / 2);
        const [firstHalf, secondHalf] = await Promise.all([
          fetchTransferLogs(provider, fromBlock, midBlock, address),
          fetchTransferLogs(provider, midBlock + 1, toBlock, address)
        ]);
        return [...firstHalf, ...secondHalf];
      }
    }

    console.warn(`Error fetching logs for blocks ${fromBlock}-${toBlock}:`, error);
    return [];
  }
}