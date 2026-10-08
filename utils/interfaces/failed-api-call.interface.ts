export interface FailedApiCall {
  readonly status: number;
  readonly method: string;
  readonly url: string;
}
