import { Page } from '@playwright/test';

import { ApiCall } from '@utils/interfaces/api-call.interface';

interface VerifyAPIsReturn200Options {
  readonly waitForNetworkIdle?: boolean;
}

export interface ApiPageInterface extends Page {
  verifyAPIsReturn200(options?: VerifyAPIsReturn200Options): Promise<ApiCall[]>;
  getAllAPICalls(): ApiCall[];
  getSuccessfulAPICalls(): ApiCall[];
  getFailingAPICalls(): ApiCall[];
  clearAPICalls(): void;
}
