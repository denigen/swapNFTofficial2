/*
  # Add NFT Sync Support
  
  1. New Tables
    - `nft_sync`
      - `id` (uuid, primary key)
      - `wallet_address` (text)
      - `contract_address` (text)
      - `token_id` (text)
      - `name` (text)
      - `collection` (text)
      - `chain_id` (integer)
      - `standard` (text)
      - `last_updated` (timestamptz)
      - `metadata` (jsonb)
  
  2. Security
    - Enable RLS
    - Add policies for read/write access
*/

CREATE TABLE IF NOT EXISTS nft_sync (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  contract_address text NOT NULL,
  token_id text NOT NULL,
  name text NOT NULL,
  collection text NOT NULL,
  chain_id integer NOT NULL,
  standard text NOT NULL,
  last_updated timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,

  -- Add constraints
  CONSTRAINT valid_wallet_address CHECK (wallet_address ~ '^0x[a-fA-F0-9]{40}$'),
  CONSTRAINT valid_contract_address CHECK (contract_address ~ '^0x[a-fA-F0-9]{40}$'),
  CONSTRAINT valid_standard CHECK (standard IN ('ERC721', 'ERC1155')),
  CONSTRAINT unique_nft_per_wallet UNIQUE (wallet_address, contract_address, token_id, chain_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS nft_sync_wallet_idx ON nft_sync(wallet_address);
CREATE INDEX IF NOT EXISTS nft_sync_contract_chain_idx ON nft_sync(contract_address, chain_id);
CREATE INDEX IF NOT EXISTS nft_sync_last_updated_idx ON nft_sync(last_updated);

-- Enable RLS
ALTER TABLE nft_sync ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read NFTs"
  ON nft_sync
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert NFTs"
  ON nft_sync
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update NFTs"
  ON nft_sync
  FOR UPDATE
  USING (true);

-- Function to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_nft_sync_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamp on updates
CREATE TRIGGER update_nft_sync_timestamp
  BEFORE UPDATE ON nft_sync
  FOR EACH ROW
  EXECUTE FUNCTION update_nft_sync_timestamp();