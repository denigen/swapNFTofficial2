export class MagicEdenError extends Error {
  constructor(
    message: string,
    public code: number
  ) {
    super(message);
    this.name = 'MagicEdenError';
  }

  static fromResponse(response: Response, message?: string): MagicEdenError {
    return new MagicEdenError(
      message || `API error: ${response.status} ${response.statusText}`,
      response.status
    );
  }
}