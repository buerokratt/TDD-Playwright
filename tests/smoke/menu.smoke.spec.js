import { test } from '@playwright/test';
import { URLS } from '../../playwright.config';

test('Menu smoke test', async ({ page }) => {
    page.context({
        storageState: 'tests/admin/.auth/user.json'
    });

    page.goto(URLS.admin + 'chat/landing')
});