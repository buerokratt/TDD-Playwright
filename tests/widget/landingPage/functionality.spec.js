import { test, expect } from '@playwright/test';

let response;

test.beforeEach('load page before each test', async ({ page }) => {
    test.info().annotations.push({ type: 'repository', description: 'Chat-Widget' });   
    response = await page.goto('https://prod.buerokratt.ee/');
});

test('should have a page response 200', async () => {   
    expect(response.status()).toBe(200);    
})

test('should have correct page URL', async ({ page }) => { 
    expect(page).toHaveURL('/');
})

test('should be enabled and visible buerokratt start button', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Ava vestlus' });
    await expect(button).toBeEnabled();
    await button.click();
    await expect(page.locator('.os-content')).toBeVisible();
});
