import { JsonRpcProvider } from 'ethers';
import { KNOWN_NFT_CONTRACTS } from '../../config/contracts/addresses';

const TRANSFER_EVENT_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const TRANSFER_SINGLE_TOPIC = '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62';
const TRANSFER_BATCH_TOPIC = '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb';

const BLOCK_RANGE = 1000;
const START_BLOCKS: Record<number, number> = {
  11155111: 3300000, // Sepolia
  1: 12000000,      // Ethereum
  8453: 1,          // Base
  56: 5000000,      // BSC
  1001: 1           // APEChain
};

export async function findNFTContracts(
  provider: JsonRpcProvider,
  address: string
): Promise<string[]> {
  try {
    const chainId = (await provider.getNetwork()).chainId;
    const contracts = new Set<string>();
    
    // Add known contracts first
    const knownContracts = KNOWN_NFT_CONTRACTS[Number(chainId)] || [];
    knownContracts.forEach(contract => contracts.add(contract.toLowerCase()));

    const latestBlock = await provider.getBlockNumber();
    const fromBlock = START_BLOCKS[Number(chainId)] || 0;
    const paddedAddress = '0x000000000000000000000000' + address.slice(2).toLowerCase();

    for (let startBlock = fromBlock; startBlock <= latestBlock; startBlock += BLOCK_RANGE) {
      const endBlock = Math.min(startBlock + BLOCK_RANGE - 1, latestBlock);
      
      try {
        const logs = await provider.getLogs({
          fromBlock: startBlock,
          toBlock: endBlock,
          topics: [
            [TRANSFER_EVENT_TOPIC, TRANSFER_SINGLE_TOPIC, TRANSFER_BATCH_TOPIC],
            null,
            paddedAddress
          ]
        });

        logs.forEach(log => contracts.add(log.address.toLowerCase()));
      } catch (error) {
        console.warn(`Error fetching logs for blocks ${startBlock}-${endBlock}:`, error);
        continue;
      }

      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return Array.from(contracts);
  } catch (error) {
    console.error('Error finding NFT contracts:', error);
    return [];
  }
}