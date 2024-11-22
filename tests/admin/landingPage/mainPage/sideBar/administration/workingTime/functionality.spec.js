import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Working Time Settings Page Validation', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the page
        await page.goto('https://admin.prod.buerokratt.ee/chat/working-time');

        // Annotate the test with repository description
        test.info().annotations.push({ type: 'repository', description: 'Buerokratt-Chatbot' });

        // Load translations
        translation = await getTranslations(page);

        // Wait for elements to load completely
        await page.waitForTimeout(3000);
    });

    test('Validate Main Heading', async ({ page }) => {
        const heading = await page.getByRole('heading', { name: `${translation.organizationWorkingTime}` });
        await expect(heading).toBeVisible();
    });

    test('Validate Header Toggles with Save and Revert', async ({ page }) => {
        const toggles = {
            workingHours247: await page.getByLabel(`${translation.workingHoursAre247}`, { exact: true }),
            publicHolidays: await page.getByLabel(`${translation.considerPublicHolidays}`, { exact: true }),
            closedOnWeekends: await page.getByLabel(`${translation.closedOnWeekends}`, { exact: true }),
            sameOnAllDays: await page.getByLabel(`${translation.sameOnAllWorkingDays}`, { exact: true }),
        };

        const initialToggleStates = {};
        for (const toggleKey in toggles) {
            const toggle = toggles[toggleKey];
            const isChecked = await toggle.getAttribute('aria-checked');
            initialToggleStates[toggleKey] = isChecked;

            if (isChecked === 'true') {
                await toggle.click();
            }
            await expect(toggle).toBeVisible();
        }

        // Save state after toggles
        const saveButton = await page.getByText(`${translation.save}`, { exact: true });
        await saveButton.click();
        await page.waitForTimeout(2000);

        // Revert toggles to their initial state
        for (const toggleKey in toggles) {
            const toggle = toggles[toggleKey];
            if (initialToggleStates[toggleKey] !== (await toggle.getAttribute('aria-checked'))) {
                await toggle.click();
            }
        }

        // Save reverted state
        await saveButton.click();
        await page.waitForTimeout(2000);
    });

    test('Validate Day-Specific Sections with Save and Revert', async ({ page }) => {
        const days = [
            `${translation.monday}`,
            `${translation.tuesday}`,
            `${translation.wednesday}`,
            `${translation.thursday}`,
            `${translation.friday}`,
            `${translation.saturday}`,
            `${translation.sunday}`,
        ];

        const initialTimeStates = {};

        for (const day of days) {
            const container = page.locator('.track', { hasText: day });

            // Locate and validate elements
            const dayLabel = container.locator(`text=${day}`);
            const dayToggle = container.locator('button[role="switch"]');
            const startTimeInput = container.locator('.startTime input');
            const endTimeInput = container.locator('.endTime input');

            await expect(dayLabel).toBeVisible();
            await expect(dayToggle).toBeVisible();
            await expect(startTimeInput).toBeVisible();
            await expect(endTimeInput).toBeVisible();

            // Capture initial states
            initialTimeStates[day] = {
                startTime: await startTimeInput.inputValue(),
                endTime: await endTimeInput.inputValue(),
                toggleState: await dayToggle.getAttribute('aria-checked'),
            };

            // Modify times for testing
            await startTimeInput.fill('08:00:00');
            await endTimeInput.fill('17:00:00');

            const dayToggleState = initialTimeStates[day].toggleState;
            if (dayToggleState === 'false') {
                await dayToggle.click();
            }
        }

        // Save state after modifications
        const saveButton = await page.getByText(`${translation.save}`, { exact: true });
        await saveButton.click();
        await page.waitForTimeout(2000);

        // Revert changes to their initial state
        for (const day of days) {
            const container = page.locator('.track', { hasText: day });
            const startTimeInput = container.locator('.startTime input');
            const endTimeInput = container.locator('.endTime input');
            const dayToggle = container.locator('button[role="switch"]');

            const { startTime, endTime, toggleState } = initialTimeStates[day];
            await startTimeInput.fill(startTime);
            await endTimeInput.fill(endTime);

            if (toggleState !== (await dayToggle.getAttribute('aria-checked'))) {
                await dayToggle.click();
            }
        }

        // Save reverted state
        await saveButton.click();
        await page.waitForTimeout(2000);
    });

    test('Validate Footer Elements with Save and Revert', async ({ page }) => {
        const absenceNotificationSwitch = await page.getByLabel(`${translation.sendANotificationOfAbsenceToTheClient}`, { exact: true });
        const contactRequestSwitch = await page.getByLabel(`${translation.sendANotificationOfAbsenceToTheClientWithAContactRequest}`, { exact: true });
        const noCsaMessageInput = await page.getByLabel(`${translation.noCsaAvailableMessage}`, { exact: true });

        // Capture initial states
        const initialFooterStates = {
            absenceNotification: await absenceNotificationSwitch.getAttribute('aria-checked'),
            contactRequest: await contactRequestSwitch.getAttribute('aria-checked'),
            noCsaMessage: await noCsaMessageInput.inputValue(),
        };

        // Modify footer switches and textarea
        await absenceNotificationSwitch.click();
        await noCsaMessageInput.fill('No agents available at the moment.');

        // Save state after modifications
        const saveButton = await page.getByText(`${translation.save}`, { exact: true });
        await saveButton.click();
        await page.waitForTimeout(2000);

        // Revert changes to their initial state
        if (initialFooterStates.absenceNotification !== (await absenceNotificationSwitch.getAttribute('aria-checked'))) {
            await absenceNotificationSwitch.click();
        }
        if (initialFooterStates.contactRequest !== (await contactRequestSwitch.getAttribute('aria-checked'))) {
            await contactRequestSwitch.click();
        }
        await noCsaMessageInput.fill(initialFooterStates.noCsaMessage);

        // Save reverted state
        await saveButton.click();
        await page.waitForTimeout(2000);
    });
});
