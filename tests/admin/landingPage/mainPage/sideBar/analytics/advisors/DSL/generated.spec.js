import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Analytics Module Tests', () => {
    test.beforeEach(async ({ page }) => {
        test.info().annotations.push({ type: 'repository', description: 'Analytics-Module' });
        await page.goto('https://admin.prod.buerokratt.ee/analytics/advisors');
        await page.waitForTimeout(3000);
        translation = await getTranslations(page);
    });

    test.describe('Heading Tests', () => {
        test('Check main heading', async ({ page }) => {
            const heading = await page.getByRole('heading', { name: `${translation.advisors}`, exact: true });
            await expect(heading).toBeVisible();
        });
    });

    test.describe('Card Section Tests', () => {
        test('Check Period Section Buttons', async ({ page }) => {
            const periodLabel = await page.getByText(`${translation.period}`, { exact: true });
            await expect(periodLabel).toBeVisible();

            const todayButton = await page.getByText(`${translation.today}`, { exact: true });
            const yesterdayButton = await page.getByText(`${translation.yesterday}`, { exact: true });
            const last30DaysButton = await page.getByText(`${translation.last30Days}`, { exact: true });
            const selectedMonthsButton = await page.getByText(`${translation.selectedMonths}`, { exact: true });
            const selectedPeriodButton = await page.getByText(`${translation.selectedPeriod}`, { exact: true });

            await expect(todayButton).toBeVisible();
            await expect(yesterdayButton).toBeVisible();
            await expect(last30DaysButton).toBeVisible();
            await expect(selectedMonthsButton).toBeVisible();
            await expect(selectedPeriodButton).toBeVisible();
        });

        test('should display Choose a metric label and metric buttons', async ({ page }) => {
            const metricLabel = await page.getByText(`${translation.chooseAMetric}`, { exact: true });
            await expect(metricLabel).toBeVisible();

            const forwardingButton = page.locator('.section').getByText(`${translation.forwarding}`, { exact: true });
            const avgResponseSpeedButton = page.locator('.section').getByText(`${translation.averageResponseSpeedInTheInstitution}`, { exact: true });
            const avgPresenceButton = page.locator('.section').getByText(`${translation.averagePresenceOfCounselors}`, { exact: true });
            const numConversationsButton = page.locator('.section').getByText(`${translation.numberOfConversationsByAdviser}`, { exact: true });
            const conversationTimeButton = page.locator('.section').getByText(`${translation.conversationTimeByAdvisor}`, { exact: true });

            await expect(forwardingButton).toBeVisible();
            await expect(avgResponseSpeedButton).toBeVisible();
            await expect(avgPresenceButton).toBeVisible();
            await expect(numConversationsButton).toBeVisible();
            await expect(conversationTimeButton).toBeVisible();
        });
        test('Check Additional Options Checkboxes', async ({ page }) => {
            const additionalOptionsLabel = await page.getByText(`${translation.additionalOptions}`, { exact: true });
            await expect(additionalOptionsLabel).toBeVisible();

            const conversationsDirectedCheckbox = page.getByText(`${translation.numberOfConversationsDirectedFromTheAdvisor}`, { exact: true });
            const counselorDirectedCheckbox = page.getByText(`${translation.counselorDirectedConversations}`, { exact: true });
            const outOfFacilityCheckbox = page.getByText(`${translation.outOfFacilityForwards}`, { exact: true });

            await expect(conversationsDirectedCheckbox).toBeVisible();
            await expect(counselorDirectedCheckbox).toBeVisible();
            await expect(outOfFacilityCheckbox).toBeVisible();
        });
    });

    test.describe('Card Header Tests', () => {
        test('Check Forwarding Header', async ({ page }) => {
            const forwardingHeading = page.getByRole('heading', { name: `${translation.forwarding}`, exact: true });
            await expect(forwardingHeading).toBeVisible();
        });

        test('Check CSV Button', async ({ page }) => {
            const csvButton = await page.getByText(`${translation.csv}`, { exact: true });
            await expect(csvButton).toBeVisible();
        });

        test('Check Chart Dropdown', async ({ page }) => {
            const chartDropdown = await page.getByRole('combobox', { name: `${translation.barChart}` });
            await expect(chartDropdown).toBeVisible();
        });
    });

    test.describe('Chart Section Tests', () => {
        test('Verify Chart Presence in Card Body', async ({ page }) => {
            const cardBody = page.locator('.card__body');
            await expect(cardBody).toContainText(`${translation.hasChart}`);
        });
    });
});
