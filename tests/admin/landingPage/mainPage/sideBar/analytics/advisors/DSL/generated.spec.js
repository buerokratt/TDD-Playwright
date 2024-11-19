import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Analytics Module Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the page
        await page.goto('https://admin.prod.buerokratt.ee/analytics/advisors');

        // Fetch translations
        translation = await getTranslations(page);

        // Add annotation
        test.info().annotations.push({ type: 'repository', description: 'Analytics-Module' });

        // Wait for elements to load
        await page.waitForTimeout(3000);
    });

    test('Validate Main Heading and Card Elements', async ({ page }) => {
        // Validate heading
        const mainHeading = await page.getByRole('heading', { name: `${translation.advisors}`, exact: true });
        await expect(mainHeading).toBeVisible();

        // Validate "Period" section
        const periodLabel = await page.getByText(`${translation.period}`, { exact: true });
        await expect(periodLabel).toBeVisible();

        const todayButton = await page.getByRole('button', { name: `${translation.today}`, exact: true });
        const yesterdayButton = await page.getByRole('button', { name: `${translation.yesterday}`, exact: true });
        const last30DaysButton = await page.getByRole('button', { name: `${translation.last30Days}`, exact: true });
        const selectedMonthsButton = await page.getByRole('button', { name: `${translation.selectedMonths}`, exact: true });
        const selectedPeriodButton = await page.getByRole('button', { name: `${translation.selectedPeriod}`, exact: true });

        await expect(todayButton).toBeVisible();
        await expect(yesterdayButton).toBeVisible();
        await expect(last30DaysButton).toBeVisible();
        await expect(selectedMonthsButton).toBeVisible();
        await expect(selectedPeriodButton).toBeVisible();

        // Validate "Choose a metric" section
        const chooseMetricLabel = await page.getByText(`${translation.chooseAMetric}`, { exact: true });
        await expect(chooseMetricLabel).toBeVisible();

        const forwardingButton = await page.getByRole('button', { name: `${translation.forwarding}`, exact: true });
        const avgResponseSpeedButton = await page.getByRole('button', { name: `${translation.averageResponseSpeedInTheInstitution}`, exact: true });
        const avgPresenceButton = await page.getByRole('button', { name: `${translation.averagePresenceOfCounselors}`, exact: true });
        const numConversationsButton = await page.getByRole('button', { name: `${translation.numberOfConversationsByAdviser}`, exact: true });
        const conversationTimeButton = await page.getByRole('button', { name: `${translation.conversationTimeByAdvisor}`, exact: true });

        await expect(forwardingButton).toBeVisible();
        await expect(avgResponseSpeedButton).toBeVisible();
        await expect(avgPresenceButton).toBeVisible();
        await expect(numConversationsButton).toBeVisible();
        await expect(conversationTimeButton).toBeVisible();
    });

    test.only('Validate Additional Options Section', async ({ page }) => {
        const additionalOptionsLabel = await page.getByText(`${translation.additionalOptions}`, { exact: true });
        await expect(additionalOptionsLabel).toBeVisible();

        const numConversationsLabel = await page.locator('label').filter({ hasText: `${translation.numberOfConversationsDirectedFromTheAdvisor}` });
        const counselorDirectedLabel = await page.locator('label').filter({ hasText: `${translation.counselorDirectedConversations}` });
        const outOfFacilityLabel = await page.locator('label').filter({ hasText: `${translation.outOfFacilityForwards}` });

        await expect(numConversationsLabel).toBeVisible();
        await expect(counselorDirectedLabel).toBeVisible();
        await expect(outOfFacilityLabel).toBeVisible();
    });

    test('Validate Chart Options in Card Header', async ({ page }) => {
        // Validate "Forwarding" heading
        const cardHeading = await page.getByRole('heading', { name: `${translation.forwarding}`, exact: true });
        await expect(cardHeading).toBeVisible();

        // Validate CSV button
        const csvButton = await page.getByRole('button', { name: `${translation.csv}`, exact: true });
        await expect(csvButton).toBeVisible();

        // Validate dropdown options
        const chartDropdown = await page.getByRole('combobox', { name: `${translation.chartOptions}`, exact: true });
        await expect(chartDropdown).toBeVisible();

        // Check dropdown values
        await chartDropdown.selectOption({ label: `${translation.barChart}` });
        await chartDropdown.selectOption({ label: `${translation.pieChart}` });
        await chartDropdown.selectOption({ label: `${translation.lineChart}` });
    });

    test('Validate Chart Presence in Card Body', async ({ page }) => {
        // Validate chart presence in card body
        const chart = await page.locator('.card__body .chart');
        await expect(chart).toBeVisible();
    });
});
