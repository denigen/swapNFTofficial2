import { JsonRpcProvider } from 'ethers';
import { KNOWN_NFT_CONTRACTS } from '../../config/contracts';

const TRANSFER_EVENT_TOPICS = [
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // ERC721/ERC20
  '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62', // ERC1155 TransferSingle
  '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb'  // ERC1155 TransferBatch
];

const BLOCK_RANGE = 2000;

export async function findNFTContracts(
  provider: JsonRpcProvider,
  address: string,
  startBlock: number
): Promise<string[]> {
  try {
    const contracts = new Set<string>();
    
    // Add known contracts first
    const chainId = Number((await provider.getNetwork()).chainId);
    const knownContracts = KNOWN_NFT_CONTRACTS[chainId] || [];
    knownContracts.forEach(contract => contracts.add(contract.toLowerCase()));

    const latestBlock = await provider.getBlockNumber();
    const paddedAddress = '0x000000000000000000000000' + address.slice(2).toLowerCase();

    // Scan blocks in ranges
    for (let fromBlock = startBlock; fromBlock <= latestBlock; fromBlock += BLOCK_RANGE) {
      const toBlock = Math.min(fromBlock + BLOCK_RANGE - 1, latestBlock);
      
      try {
        // Get transfer events where the address is recipient
        const logs = await provider.getLogs({
          fromBlock,
          toBlock,
          topics: [
            TRANSFER_EVENT_TOPICS,
            null,
            paddedAddress
          ]
        });

        logs.forEach(log => contracts.add(log.address.toLowerCase()));
      } catch (error) {
        console.warn(`Error scanning blocks ${fromBlock}-${toBlock}:`, error);
        continue;
      }

      // Add small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return Array.from(contracts);
  } catch (error) {
    console.error('Error finding NFT contracts:', error);
    return [];
  }
}