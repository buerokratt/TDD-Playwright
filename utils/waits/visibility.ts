import { Locator } from '@playwright/test';

export async function isEventuallyVisible(locator: Locator, timeout: number): Promise<boolean> {
  return locator.waitFor({ state: 'visible', timeout }).then(
    () => true,
    () => false,
  );
}
