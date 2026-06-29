import { test as base, expect } from '@playwright/test';

import { ReadyPageInterface } from '@utils/interfaces';
import { waitForRouteReady } from '@utils/waits';

export const test = base.extend<{ page: ReadyPageInterface }>({
  page: async ({ page }, use) => {
    const readyPage = page as ReadyPageInterface;
    const originalGoto = page.goto.bind(page);

    page.goto = async (url, options = {}) => {
      const result = await originalGoto(url, {
        waitUntil: 'domcontentloaded',
        ...options,
      });
      await waitForRouteReady(page, url, { timeout: options.timeout ?? 15000 });
      return result;
    };

    readyPage.waitForRouteReady = async (url, options = {}) => {
      await waitForRouteReady(page, url, options);
    };

    page.on('console', (msg) => {
      const errorPattern =
        /error|failed|uncaught|exception|typeerror|referenceerror|syntaxerror|rangeerror|evalerror|urlerror|is not defined|cannot read|undefined|null is not an object/i;

      if (msg.type() === 'error' || errorPattern.test(msg.text())) {
        console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
      }
    });

    await use(readyPage);
  },
});

export { expect };
