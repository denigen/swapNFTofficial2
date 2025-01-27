export const ORDER_SERVICE_ERRORS = {
  NOT_INITIALIZED: 'Order service not initialized',
  FETCH_FAILED: 'Failed to fetch orders',
  INVALID_ADDRESS: 'Invalid wallet address provided',
  PROVIDER_ERROR: 'Error connecting to network',
  EVENT_FETCH_ERROR: 'Failed to fetch order events',
  QUERY_ERROR: 'Failed to query order details',
  BASESCAN_ERROR: 'Failed to fetch data from BASE Scan'
} as const;

export type OrderServiceError = typeof ORDER_SERVICE_ERRORS[keyof typeof ORDER_SERVICE_ERRORS];