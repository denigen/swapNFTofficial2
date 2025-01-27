export const ORDER_EVENT_TOPICS = {
  SWAP_ORDER_CREATED: '0x20349c2498759f7e31a0d7a77f1d58067d0e8b3c09c8a02b4bd42fc32bfebfa0'
};

export function padAddress(address: string): string {
  return '0x' + address.toLowerCase().padStart(64, '0');
}

export function createEventFilter(contractAddress: string, eventTopic: string, address?: string) {
  const filter: any = {
    address: contractAddress,
    topics: [eventTopic]
  };

  if (address) {
    filter.topics = [...filter.topics, null, null, padAddress(address)];
  }

  return filter;
}