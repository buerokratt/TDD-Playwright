import type { Page } from '@playwright/test';

import type { WidgetPage } from '@page-objects/widget';

export interface CustomerFixtures {
  readonly customerPage: Page;
  readonly widgetPage: WidgetPage;
}
