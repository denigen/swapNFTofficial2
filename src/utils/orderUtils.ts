export function shortenOrderId(orderId: string): string {
  // Take first 6 and last 4 characters of the order ID
  return `${orderId.slice(0, 6)}...${orderId.slice(-4)}`;
}

export function formatOrderNumber(orderId: string): string {
  // Take just the first 8 characters for display
  return `#${orderId.slice(0, 8)}`;
}