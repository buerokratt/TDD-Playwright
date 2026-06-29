import { Page } from '@playwright/test';

import { RouteReadyOptions } from '@utils/interfaces/route-ready-options.interface';

export interface ReadyPageInterface extends Page {
  waitForRouteReady(url: string, options?: RouteReadyOptions): Promise<void>;
}
