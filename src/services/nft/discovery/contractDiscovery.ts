import { JsonRpcProvider } from 'ethers';
import { KNOWN_NFT_CONTRACTS } from '../../../config/contracts/addresses';
import { getScanConfig } from './scanConfig';
import { fetchTransferLogs } from './logFetcher';
import { getNetworkConfig } from '../../../config/networks';

export async function findNFTContracts(
  provider: JsonRpcProvider,
  address: string
): Promise<string[]> {
  try {
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    const networkConfig = getNetworkConfig(chainId);

    if (!networkConfig) {
      console.warn(`No configuration found for chain ID ${chainId}`);
      return [];
    }

    const scanConfig = await getScanConfig(provider, chainId);
    const contracts = new Set<string>();

    // Add known contracts first
    const knownContracts = KNOWN_NFT_CONTRACTS[chainId] || [];
    knownContracts.forEach(contract => contracts.add(contract.toLowerCase()));

    console.log(`Starting contract discovery for ${address} from block ${scanConfig.fromBlock}`);

    // Scan blocks in batches with error handling
    for (let from = scanConfig.fromBlock; from <= scanConfig.toBlock; from += scanConfig.batchSize) {
      const to = Math.min(from + scanConfig.batchSize - 1, scanConfig.toBlock);
      
      try {
        const logs = await fetchTransferLogs(provider, from, to, address);
        logs.forEach(log => contracts.add(log.address.toLowerCase()));

        if (from + scanConfig.batchSize <= scanConfig.toBlock) {
          await new Promise(resolve => setTimeout(resolve, scanConfig.delayMs));
        }
      } catch (error) {
        console.warn(`Error scanning blocks ${from}-${to}:`, error);
        continue; // Continue with next batch even if one fails
      }
    }

    const discoveredContracts = Array.from(contracts);
    console.log(`Found ${discoveredContracts.length} NFT contracts for ${address}`);
    
    return discoveredContracts;
  } catch (error) {
    console.error('Error in NFT contract discovery:', error);
    return [];
  }
}