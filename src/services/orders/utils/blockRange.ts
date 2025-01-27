import { MAX_BLOCK_RANGE } from '../constants';

export function calculateBlockRange(currentBlock: number) {
  return {
    fromBlock: Math.max(currentBlock - MAX_BLOCK_RANGE, 0),
    toBlock: currentBlock
  };
}