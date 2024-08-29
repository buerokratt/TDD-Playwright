import { test, expect } from '@playwright/test';

const adminPage = 'https://admin.prod.buerokratt.ee/'
let response;

test.beforeEach(async ({ page }) => {
    response = await page.goto(adminPage)
});


test.describe('basic connectivity', () => {
    test('should have a page response 200', async () => {   
        expect(response.status()).toBe(200);    
    })

    test('should have correct page URL', async ({ page }) => { 
        await expect(page).toHaveURL(adminPage + 'et/log-in');
    })
})

test.describe("auth button functionality", () => {
    test('should be enabled', async ({ page }) => {
        await expect(page.getByRole('button', { name: 'sisene TARA kaudu' })).toBeEnabled();
    })

    test("should start auth process on click", async ({ page }) => {
        page.getByRole('button', { name: 'sisene TARA kaudu' }).click()
        await page.waitForURL();
        await expect(page).toHaveTitle(/Riigi autentimisteenus/)
        await expect(page).toHaveURL(/.*tara-test\.ria\.ee.*/);
    })
})
