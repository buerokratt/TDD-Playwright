import { Page } from '@playwright/test';

export interface ApiCall {
  readonly url: string;
  readonly method: string;
  readonly timestamp: number;
  status: number | null;
}

export interface VerifyAPIsReturn200Options {
  readonly waitForNetworkIdle?: boolean;
}

export interface ApiPageInterface extends Page {
  verifyAPIsReturn200(options?: VerifyAPIsReturn200Options): Promise<ApiCall[]>;
  getAllAPICalls(): ApiCall[];
  getSuccessfulAPICalls(): ApiCall[];
  getFailingAPICalls(): ApiCall[];
  clearAPICalls(): void;
}
