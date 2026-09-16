import { Page } from '@playwright/test';

import { RouteReadyOptions } from './route-ready-options.interface';

export interface ReadyPageInterface extends Page {
  waitForRouteReady(url: string, options?: RouteReadyOptions): Promise<void>;
}
