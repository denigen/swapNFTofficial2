export class OpenSeaError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: string
  ) {
    super(message);
    this.name = 'OpenSeaError';
  }

  static fromResponse(response: Response, errorText?: string): OpenSeaError {
    return new OpenSeaError(
      `OpenSea API error: ${response.status} - ${errorText || response.statusText}`,
      response.status
    );
  }
}