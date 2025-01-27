export class ApeChainError extends Error {
  constructor(
    message: string,
    public code: number
  ) {
    super(message);
    this.name = 'ApeChainError';
  }

  static fromResponse(response: any): ApeChainError {
    return new ApeChainError(
      response.error?.message || 'Unknown error',
      response.error?.code || 500
    );
  }
}