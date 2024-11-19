import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Working time - Visibility Tests', () => {
    test.beforeEach(async ({ page }) => {
        test.info().annotations.push({ type: 'repository', description: 'Working time' });
        await page.goto('https://admin.prod.buerokratt.ee/chat/working-time');
        await page.waitForTimeout(3000);
        translation = await getTranslations(page);
    });

    test('Main Heading visibility', async ({ page }) => {
        const heading = await page.getByRole('heading', { name: `${translation.organizationWorkingTime}`, exact: true });
        await expect(heading).toBeVisible();
    });

    test.describe('Card Header visibility', () => {
        test('Working Hours Are 24/7 toggle', async ({ page }) => {
            const toggle = await page.getByLabel(`${translation.workingHoursAre247}`, { exact: true });
            await expect(toggle).toBeVisible();
        });

        test('Consider Public Holidays toggle', async ({ page }) => {
            const toggle = await page.getByLabel(`${translation.considerPublicHolidays}`, { exact: true });
            await expect(toggle).toBeVisible();
        });

        test('Closed On Weekends toggle', async ({ page }) => {
            const toggle = await page.getByLabel(`${translation.closedOnWeekends}`, { exact: true });
            await expect(toggle).toBeVisible();
        });

        test('Same On All Working Days toggle', async ({ page }) => {
            const toggle = await page.getByLabel(`${translation.sameOnAllWorkingDays}`, { exact: true });
            await expect(toggle).toBeVisible();
        });
    });

    test.describe('Card Body visibility', () => {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        days.forEach((day) => {
            test(`${day} elements visibility`, async ({ page }) => {
                const card = page.locator('.card__body');
                const label = await card.locator(`${translation[day.toLowerCase()]}`);
                const toggle = await card.locator(`.track`).locator('nth=0');
                const startTimeInput = await card.locator(`.track`).locator('nth=1');
                const endTimeInput = await card.locator(`.track`).locator('nth=2');

                await expect(label).toBeVisible();
                await expect(toggle).toBeVisible();
                await expect(startTimeInput).toBeVisible();
                await expect(endTimeInput).toBeVisible();
            });
        });
    });

    test.describe('Card Footer visibility', () => {
        test('Save Button visibility', async ({ page }) => {
            const saveButton = await page.getByText(`${translation.save}`, { exact: true });
            await expect(saveButton).toBeVisible();
        });

        test('Send Notification Of Absence toggles visibility', async ({ page }) => {
            const absenceToggle = await page.getByLabel(`${translation.sendANotificationOfAbsenceToTheClient}`, { exact: true });
            const contactToggle = await page.getByLabel(`${translation.sendANotificationOfAbsenceToTheClientWithAContactRequest}`, { exact: true });

            await expect(absenceToggle).toBeVisible();
            await expect(contactToggle).toBeVisible();
        });

        test('No CSA Available Message textarea visibility', async ({ page }) => {
            const textArea = await page.getByLabel(`${translation.noCsaAvailableMessage}`, { exact: true });
            await expect(textArea).toBeVisible();
        });
    });
});
