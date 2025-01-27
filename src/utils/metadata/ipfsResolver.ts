export function resolveIPFSUrl(url: string): string {
  if (!url) return '';
  
  if (url.startsWith('ipfs://')) {
    return `https://ipfs.io/ipfs/${url.slice(7)}`;
  }
  
  if (url.startsWith('ar://')) {
    return `https://arweave.net/${url.slice(5)}`;
  }
  
  return url;
}

export async function fetchMetadata(tokenURI: string) {
  const resolvedUrl = resolveIPFSUrl(tokenURI);
  
  try {
    const response = await fetch(resolvedUrl);
    if (!response.ok) throw new Error('Failed to fetch metadata');
    return await response.json();
  } catch (error) {
    console.warn('Error fetching metadata:', error);
    return null;
  }
}