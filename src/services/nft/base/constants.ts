export const KNOWN_BASE_CONTRACTS = [
  // Known BASE NFT contracts - verified and active
  '0x7d5861cfe1c74aaa0999b7e2651bf2ebd2a62d89', // Base Monkeys
  '0xb3da098a7251a647892203e0c256b4398d131a54', // Base Punks
  '0xd4307e0acd12cf46fd6cf93bc264f5d5d1598792', // Base Birds
  '0x5c1a0cc6dadf4d0fb31425461df25f56dc7dab66', // Base Bored Apes
  '0x921123a0a6dbf5b198f829399f557951f783c0dc'  // Base Cats
] as const;

export const BASE_SCAN_CONFIG = {
  BATCH_SIZE: 3,           // Process 3 contracts at a time
  REQUEST_DELAY: 1000,     // 1 second delay between requests
  MAX_RETRIES: 3,
  INITIAL_DELAY: 1000,
  MAX_BLOCKS_PER_SCAN: 10000,
  START_BLOCK: 1,         // BASE chain genesis block
  TRANSFER_TOPICS: {
    ERC721: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    ERC1155_SINGLE: '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
    ERC1155_BATCH: '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb'
  }
} as const;