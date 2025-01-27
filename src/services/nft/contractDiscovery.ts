import { JsonRpcProvider } from 'ethers';
import { KNOWN_NFT_CONTRACTS } from '../../config/contracts/addresses';
import { getNetworkConfig } from '../../config/networks';

const TRANSFER_EVENT_TOPICS = {
  ERC721: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  ERC1155_SINGLE: '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
  ERC1155_BATCH: '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb'
};

interface ScanConfig {
  fromBlock: number;
  toBlock: number;
  batchSize: number;
  delayMs: number;
}

export async function findNFTContracts(
  provider: JsonRpcProvider,
  address: string
): Promise<string[]> {
  try {
    const chainId = Number((await provider.getNetwork()).chainId);
    const networkConfig = getNetworkConfig(chainId);
    
    if (!networkConfig) {
      throw new Error(`No configuration found for chain ID ${chainId}`);
    }

    const scanConfig = await prepareScanConfig(provider, networkConfig.startBlock);
    const contracts = await discoverContracts(provider, address, scanConfig, chainId);

    console.log(`Found ${contracts.size} NFT contracts for address ${address}`);
    return Array.from(contracts);
  } catch (error) {
    console.error('Error in NFT contract discovery:', error);
    return [];
  }
}

async function prepareScanConfig(
  provider: JsonRpcProvider,
  startBlock: number
): Promise<ScanConfig> {
  const latestBlock = await provider.getBlockNumber();
  return {
    fromBlock: startBlock,
    toBlock: latestBlock,
    batchSize: 2000,
    delayMs: 100
  };
}

async function discoverContracts(
  provider: JsonRpcProvider,
  address: string,
  config: ScanConfig,
  chainId: number
): Promise<Set<string>> {
  const contracts = new Set<string>();
  
  // Add known contracts first
  const knownContracts = KNOWN_NFT_CONTRACTS[chainId] || [];
  knownContracts.forEach(contract => contracts.add(contract.toLowerCase()));

  const paddedAddress = padAddress(address);
  
  // Scan blocks in batches
  for (let from = config.fromBlock; from <= config.toBlock; from += config.batchSize) {
    const to = Math.min(from + config.batchSize - 1, config.toBlock);
    
    try {
      const logs = await fetchTransferLogs(provider, from, to, paddedAddress);
      logs.forEach(log => contracts.add(log.address.toLowerCase()));
      
      if (from + config.batchSize <= config.toBlock) {
        await new Promise(resolve => setTimeout(resolve, config.delayMs));
      }
    } catch (error) {
      console.warn(`Error scanning blocks ${from}-${to}:`, error);
      continue;
    }
  }

  return contracts;
}

async function fetchTransferLogs(
  provider: JsonRpcProvider,
  fromBlock: number,
  toBlock: number,
  paddedAddress: string
) {
  return provider.getLogs({
    fromBlock,
    toBlock,
    topics: [
      [
        TRANSFER_EVENT_TOPICS.ERC721,
        TRANSFER_EVENT_TOPICS.ERC1155_SINGLE,
        TRANSFER_EVENT_TOPICS.ERC1155_BATCH
      ],
      null,
      paddedAddress
    ]
  });
}

function padAddress(address: string): string {
  return '0x000000000000000000000000' + address.slice(2).toLowerCase();
}