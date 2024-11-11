import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    // Navigate to the page where switches are located
    await page.goto('https://admin.prod.buerokratt.ee/chat/active');
    await page.getByRole('button', { name: 'Ajutine' }).click();
    await page.waitForTimeout(1000);
    await expect(page.locator('.drawer')).toBeVisible();
});

test.describe('Switch button functionality', () => {
    test('toggle Voice Notification switches and verify state changes', async ({ page }) => {
        const voiceSwitches = [
            { name: 'Uus suunatud vestlus (Voice)', selector: 'button#\\:r2\\:' },
            { name: 'Uus vastamata vestlus (Voice)', selector: 'button#\\:r3\\:' }
        ];

        // Loop through each Voice Notification switch
        for (const { name, selector } of voiceSwitches) {
            const switchButton = page.locator(selector);
            const originalState = await switchButton.getAttribute('aria-checked');

            // Toggle the switch
            await switchButton.click();
            const newState = originalState === 'true' ? 'false' : 'true';
            await expect(switchButton).toHaveAttribute('aria-checked', newState);

            // Toggle back to original state
            await switchButton.click();
            await expect(switchButton).toHaveAttribute('aria-checked', originalState);

            //console.log(`Toggled ${name} and reverted to original state.`);
        }
    });

    test('toggle Pop-up Notification switches and verify state changes', async ({ page }) => {
        const popupSwitches = [
            { name: 'Uus suunatud vestlus (Pop-up)', selector: 'button#\\:r4\\:' },
            { name: 'Uus vastamata vestlus (Pop-up)', selector: 'button#\\:r5\\:' }
        ];

        // Loop through each Pop-up Notification switch
        for (const { name, selector } of popupSwitches) {
            const switchButton = page.locator(selector);
            const originalState = await switchButton.getAttribute('aria-checked');

            // Toggle the switch
            await switchButton.click();
            const newState = originalState === 'true' ? 'false' : 'true';
            await expect(switchButton).toHaveAttribute('aria-checked', newState);

            // Toggle back to original state
            await switchButton.click();
            await expect(switchButton).toHaveAttribute('aria-checked', originalState);
        }
    });
});
