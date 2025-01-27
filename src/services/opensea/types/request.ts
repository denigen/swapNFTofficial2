export interface OpenSeaRequestOptions {
  timeout?: number;
  retries?: number;
  signal?: AbortSignal;
}

export interface OpenSeaRequestConfig extends RequestInit {
  signal?: AbortSignal;
  timeout?: number;
}