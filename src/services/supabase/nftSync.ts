import { supabase } from './client';
import { NFTToken } from '../../types/nft';

export async function syncNFTs(
  walletAddress: string,
  nfts: NFTToken[],
  chainId: number
) {
  try {
    // Delete existing NFTs for this wallet and chain
    await supabase
      .from('nft_sync')
      .delete()
      .match({ 
        wallet_address: walletAddress.toLowerCase(),
        chain_id: chainId 
      });

    // Insert new NFTs
    const { error } = await supabase
      .from('nft_sync')
      .insert(
        nfts.map(nft => ({
          wallet_address: walletAddress.toLowerCase(),
          contract_address: nft.contractAddress.toLowerCase(),
          token_id: nft.tokenId,
          name: nft.name,
          collection: nft.collection,
          chain_id: chainId,
          standard: nft.standard || 'ERC721',
          metadata: {
            balance: nft.balance
          }
        }))
      );

    if (error) throw error;
  } catch (error) {
    console.error('Error syncing NFTs to Supabase:', error);
    throw error;
  }
}

export async function getCounterpartyNFTs(
  walletAddress: string,
  chainId: number
): Promise<NFTToken[]> {
  try {
    const { data, error } = await supabase
      .from('nft_sync')
      .select('*')
      .match({ 
        wallet_address: walletAddress.toLowerCase(),
        chain_id: chainId 
      })
      .order('last_updated', { ascending: false });

    if (error) throw error;

    return data.map(nft => ({
      id: `${nft.contract_address}-${nft.token_id}`,
      name: nft.name,
      collection: nft.collection,
      imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400',
      contractAddress: nft.contract_address,
      tokenId: nft.token_id,
      chainId: nft.chain_id,
      standard: nft.standard as 'ERC721' | 'ERC1155',
      balance: nft.metadata?.balance
    }));
  } catch (error) {
    console.error('Error fetching counterparty NFTs from Supabase:', error);
    throw error;
  }
}