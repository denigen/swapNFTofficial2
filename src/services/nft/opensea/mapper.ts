import { NFTToken } from '../../../types/nft';
import { OpenSeaAsset } from './types';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400';

export function mapOpenSeaAssetToNFT(asset: OpenSeaAsset, chainId: number): NFTToken {
  return {
    id: `${asset.contract}-${asset.identifier}`,
    name: asset.name || `${asset.collection} #${asset.identifier}`,
    collection: asset.collection,
    imageUrl: asset.image_url || DEFAULT_IMAGE,
    contractAddress: asset.contract,
    tokenId: asset.identifier,
    chainId,
    standard: asset.token_standard,
    balance: asset.token_standard === 'ERC1155' ? Number(asset.balance) : undefined
  };
}