/*
  # Create orders table with RLS policies

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `wallet_address` (text, indexed)
      - `order_id` (text)
      - `maker` (text)
      - `taker` (text)
      - `maker_nfts` (jsonb)
      - `taker_nfts` (jsonb)
      - `created_at` (timestamptz)
      - `status` (text)
      - `tx_hash` (text, nullable)
      - `chain_id` (integer)
      - `is_active` (boolean)

  2. Security
    - Enable RLS on `orders` table
    - Add policy for users to read their own orders (as maker or taker)
    - Add policy for users to insert their own orders
    - Add policy for users to update their own orders
*/

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  order_id text NOT NULL,
  maker text NOT NULL,
  taker text NOT NULL,
  maker_nfts jsonb NOT NULL,
  taker_nfts jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',
  tx_hash text,
  chain_id integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  
  -- Add constraints
  CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'cancelled')),
  CONSTRAINT valid_addresses CHECK (
    wallet_address ~ '^0x[a-fA-F0-9]{40}$' AND
    maker ~ '^0x[a-fA-F0-9]{40}$' AND
    taker ~ '^0x[a-fA-F0-9]{40}$'
  )
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS orders_wallet_address_idx ON orders(wallet_address);
CREATE INDEX IF NOT EXISTS orders_maker_taker_idx ON orders(maker, taker);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own orders"
  ON orders
  FOR SELECT
  USING (
    wallet_address = auth.jwt() ->> 'wallet_address' OR
    maker = auth.jwt() ->> 'wallet_address' OR
    taker = auth.jwt() ->> 'wallet_address'
  );

CREATE POLICY "Users can insert their own orders"
  ON orders
  FOR INSERT
  WITH CHECK (wallet_address = auth.jwt() ->> 'wallet_address');

CREATE POLICY "Users can update their own orders"
  ON orders
  FOR UPDATE
  USING (wallet_address = auth.jwt() ->> 'wallet_address');