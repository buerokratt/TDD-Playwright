import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Analytics Module - Chats Functionality Testing', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://admin.prod.buerokratt.ee/analytics/chats');
        translation = await getTranslations(page);
        test.info().annotations.push({ type: 'repository', description: 'Analytics-Module' });
        await page.waitForTimeout(3000);
    });

    test('should display and allow interaction with date pickers in the Selected Period section', async ({ page }) => {
        const periodLabel = page.getByText(`${translation.period}`, { exact: true });
        const startDatePicker = page.locator('.datepicker').nth(0);
        const endDatePicker = page.locator('.datepicker').nth(1);
        const selectedPeriodButton = page.getByRole('button', { name: `${translation.selectedPeriod}`, exact: true });

        await expect(periodLabel).toBeVisible();
        await expect(selectedPeriodButton).toBeVisible();
        await selectedPeriodButton.click();

        await expect(startDatePicker).toBeVisible();
        await expect(endDatePicker).toBeVisible();

        const startInput = startDatePicker.locator('input').first();
        const endInput = endDatePicker.locator('input').first();

        await startInput.fill('01.01.2024');
        await endInput.fill('31.12.2024');

        const updatedStartValue = await startInput.getAttribute('value');
        const updatedEndValue = await endInput.getAttribute('value');

        expect(updatedStartValue).toBe('01.01.2024');
        expect(updatedEndValue).toBe('31.12.2024');
    });

    test('should validate chart selection and display correct chart type', async ({ page }) => {
        const dropdown = await page.getByText(new RegExp(translation.barChart)).first();
        await dropdown.click();

        const pieChartOption = page.getByRole('option', { name: `${translation.pieChart}`, exact: true });
        await pieChartOption.click();

        const activeDropdown = await page.getByText(new RegExp(translation.pieChart)).first();
        await expect(activeDropdown).toContainText(`${translation.pieChart}`);

    });

    test('should interact with and validate metric selection buttons', async ({ page }) => {
        const metricButtons = [
            `${translation.totalNumberOfChats}`,
            `${translation.contactInformationProvided}`,
            `${translation.averageConversationTimeMin}`,
            `${translation.averageWaitingTimeMin}`,
            `${translation.averageNumberOfMessagesInAChat}`,
            `${translation.countOfIdleChatsEndedByBuerokratt}`,
        ];

        for (const metric of metricButtons) {
            const button = page.getByRole('button', { name: metric, exact: true });
            await expect(button).toBeVisible();
            await button.click();
            await expect(button).toBeEnabled();
        }
    });

    test('should toggle additional options checkboxes and validate state', async ({ page }) => {
        const checkboxes = [
            `${translation.onlyBuerokrattInvolved}`,
            `${translation.csaInvolved}`,
            `${translation.total}`,
        ];

        for (const checkboxLabel of checkboxes) {
            const checkbox = page.getByRole('checkbox', { name: checkboxLabel, exact: true });
            await expect(checkbox).toBeVisible();
            await checkbox.check();
            await expect(checkbox).toBeChecked();
            await checkbox.uncheck();
            await expect(checkbox).not.toBeChecked();
        }
    });

    test('should download CSV and validate export button functionality', async ({ page }) => {
        const csvButton = page.getByRole('button', { name: `${translation.csv}`, exact: true });
        await expect(csvButton).toBeVisible();
        await csvButton.click();
        // Validate CSV download if possible with a mocking mechanism or file system check.
    });
});
