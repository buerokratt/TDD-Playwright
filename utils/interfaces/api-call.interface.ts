export interface ApiCall {
  readonly url: string;
  readonly method: string;
  readonly timestamp: number;
  status: number | null;
}
