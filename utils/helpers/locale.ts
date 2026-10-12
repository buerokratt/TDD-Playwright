import { BrowserContext, Page } from '@playwright/test';

export async function seedEnglishLocale(target: BrowserContext | Page): Promise<void> {
  await target.addInitScript(() => window.localStorage.setItem('i18nextLng', 'en'));
}
