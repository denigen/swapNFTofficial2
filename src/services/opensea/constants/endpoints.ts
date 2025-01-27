export const OPENSEA_ENDPOINTS = {
  ACCOUNT_NFTS: (chainName: string, address: string) => 
    `/chain/${chainName}/account/${address}/nfts`,
  COLLECTION_NFTS: (chainName: string, collection: string) =>
    `/chain/${chainName}/collection/${collection}/nfts`
} as const;