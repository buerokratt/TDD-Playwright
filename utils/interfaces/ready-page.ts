import { Page } from '@playwright/test';

import { RouteReadyOptions } from '@utils/interfaces/route-ready-options';

export interface ReadyPage extends Page {
  waitForRouteReady(url: string, options?: RouteReadyOptions): Promise<void>;
}
