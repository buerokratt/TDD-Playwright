import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Analytics Module - Advisors Functionality Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://admin.prod.buerokratt.ee/analytics/advisors');
        translation = await getTranslations(page);
        test.info().annotations.push({ type: 'repository', description: 'Analytics-Module' });
        await page.waitForTimeout(3000);
    });

    test('Verify Period buttons functionality', async ({ page }) => {
        const cardBody = page.locator('.card__body');

        const todayButton = cardBody.getByRole('button', { name: `${translation.today}`, exact: true });
        const yesterdayButton = cardBody.getByRole('button', { name: `${translation.yesterday}`, exact: true });

        await todayButton.click();
        const todayIsActive = await todayButton.getAttribute('class');
        expect(todayIsActive).toContain('active'); // Assuming active class exists when selected

        await yesterdayButton.click();
        const yesterdayIsActive = await yesterdayButton.getAttribute('class');
        expect(yesterdayIsActive).toContain('active');
    });

    test('Validate metric selection functionality', async ({ page }) => {
        const cardBody = page.locator('.card__body');

        const metricButton = cardBody.getByRole('button', { name: `${translation.forwarding}`, exact: true });
        await metricButton.click();

        const selectedMetric = page.locator('.selected-metric'); // Assuming selected metric is displayed in this class
        await expect(selectedMetric).toHaveText(`${translation.forwarding}`);
    });

    test('Verify checkbox toggle functionality', async ({ page }) => {
        const cardBody = page.locator('.card__body');

        const directedConversationsCheckbox = cardBody.getByLabel(`${translation.numberOfConversationsDirectedFromTheAdvisor}`, { exact: true });
        await directedConversationsCheckbox.check();
        await expect(directedConversationsCheckbox).toBeChecked();

        await directedConversationsCheckbox.uncheck();
        await expect(directedConversationsCheckbox).not.toBeChecked();
    });

    test('Validate chart selection functionality', async ({ page }) => {
        const dropdown = page.getByText(new RegExp(translation.barChart));
        await dropdown.click();

        const barChartOption = page.getByText('Bar Chart', { exact: true });
        const pieChartOption = page.getByText('Pie Chart', { exact: true });

        await barChartOption.click();
        const activeChart = page.locator('.active-chart'); // Assuming active chart indicator
        await expect(activeChart).toHaveText('Bar Chart');

        await pieChartOption.click();
        await expect(activeChart).toHaveText('Pie Chart');
    });

    test('Verify CSV export button functionality', async ({ page }) => {
        const csvButton = page.getByRole('button', { name: `${translation.csv}`, exact: true });

        const [download] = await Promise.all([
            page.waitForEvent('download'), // Wait for download to trigger
            csvButton.click(),
        ]);

        const downloadPath = await download.path();
        expect(downloadPath).toContain('.csv'); // Verify download file is a CSV
    });
});
