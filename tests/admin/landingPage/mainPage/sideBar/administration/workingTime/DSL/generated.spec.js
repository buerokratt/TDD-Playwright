import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Working Time Settings Page Validation', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the Working Time page
        await page.goto('https://admin.prod.buerokratt.ee/chat/working-time');

        // Load translations
        translation = await getTranslations(page);

        // Ensure the page loads completely
        await page.waitForTimeout(3000);
    });

    test('Validate Working Time settings page UI and interactions', async ({ page }) => {
        test.info().annotations.push({
            description: 'Validate visibility, toggle handling, and inputs for Working Time settings page.',
        });

        // Main Heading
        const mainHeading = await page.getByRole('heading', { name: `${translation.organizationWorkingTime}`, exact: true });
        await expect(mainHeading).toBeVisible();

        // Card Header Toggles
        const toggles = [
            { label: translation.workingHoursAre247, initialState: 'true' },
            { label: translation.considerPublicHolidays, initialState: null },
            { label: translation.closedOnWeekends, initialState: 'true' },
            { label: translation.sameOnAllWorkingDays, initialState: 'true' },
        ];

        for (const toggle of toggles) {
            const toggleSwitch = await page.getByLabel(`${toggle.label}`, { exact: true });
            const state = await toggleSwitch.getAttribute('aria-checked');
            if (state === toggle.initialState) {
                await toggleSwitch.click();
            }
            await expect(toggleSwitch).toBeVisible();
        }

        // Card Body: Day-specific sections
        const days = [
            translation.monday,
            translation.tuesday,
            translation.wednesday,
            translation.thursday,
            translation.friday,
            translation.saturday,
            translation.sunday,
        ];

        for (const day of days) {
            const container = page.locator('.track', { hasText: day });

            // Locate child elements within the specific day's track
            const dayLabel = container.locator('text=' + day);
            const dayToggle = container.locator('button[role="switch"]');
            const startTimeInput = container.locator('.startTime input');
            const endTimeInput = container.locator('.endTime input');

            // Assertions for visibility
            await expect(dayLabel).toBeVisible();
            await expect(dayToggle).toBeVisible();
            await expect(startTimeInput).toBeVisible();
            await expect(endTimeInput).toBeVisible();

            // Interact with day toggle if necessary
            const dayToggleState = await dayToggle.getAttribute('aria-checked');
            if (dayToggleState === 'true') {
                await dayToggle.click();
            }
        }

        // Card Footer: Footer Elements
        const saveButton = await page.getByRole('button', { name: `${translation.save}`, exact: true });
        const absenceNotification = await page.getByLabel(`${translation.sendANotificationOfAbsenceToTheClient}`, { exact: true });
        const contactNotification = await page.getByLabel(`${translation.sendANotificationOfAbsenceToTheClientWithAContactRequest}`, { exact: true });
        const noCsaMessage = await page.getByLabel(`${translation.noCsaAvailableMessage}`, { exact: true });

        // Assertions for visibility
        await expect(saveButton).toBeVisible();
        await expect(absenceNotification).toBeVisible();
        await expect(contactNotification).toBeVisible();
        await expect(noCsaMessage).toBeVisible();
    });
});