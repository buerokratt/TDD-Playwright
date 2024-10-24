import { test, expect } from '@playwright/test';

test.describe('Widget stress check', () => {

    test('Ask Bürokratt about income tax', async ({ page }) => {
       
        await page.goto('https://prod.buerokratt.ee');
 
        const logoImage = page.locator('img[alt="Buerokratt logo"]');
        await expect(logoImage).toBeVisible(); // Wait for logo to be visible
        await logoImage.click();

   
        const chatBox = page.getByPlaceholder('Kirjutage oma sõnum...');
        await chatBox.click();
        await chatBox.fill('Kui suur on tulumaks?');

    
        const sendButton = page.getByLabel('Saada');
        await expect(sendButton).toBeEnabled(); 
        await sendButton.click();

        page.waitForTimeout(4000)

        
        const chatResponse = page.locator('.os-content > div:nth-child(3)');
        await expect(chatResponse).toHaveText(/tulumaks/i);
    });
});