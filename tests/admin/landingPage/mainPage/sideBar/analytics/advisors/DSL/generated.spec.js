import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Analytics Module - Advisors', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://admin.prod.buerokratt.ee/analytics/advisors');
        translation = await getTranslations(page);
        test.info().annotations.push({ type: 'repository', description: 'Analytics-Module' });
        await page.waitForTimeout(3000);
    });

    test('Validate main heading', async ({ page }) => {
        const heading = await page.getByRole('heading', { name: `${translation.advisors}`, exact: true });
        await expect(heading).toBeVisible();
    });

    test.describe('Period Selection', () => {
        test('Validate buttons under Period section', async ({ page }) => {
            const cardBody = page.locator('.card__body');

            const todayButton = cardBody.getByRole('button', { name: `${translation.today}`, exact: true });
            const yesterdayButton = cardBody.getByRole('button', { name: `${translation.yesterday}`, exact: true });
            const last30DaysButton = cardBody.getByRole('button', { name: `${translation.last30Days}`, exact: true });
            const selectedMonthsButton = cardBody.getByRole('button', { name: `${translation.selectedMonths}`, exact: true });
            const selectedPeriodButton = cardBody.getByRole('button', { name: `${translation.selectedPeriod}`, exact: true });

            await expect(todayButton).toBeVisible();
            await expect(yesterdayButton).toBeVisible();
            await expect(last30DaysButton).toBeVisible();
            await expect(selectedMonthsButton).toBeVisible();
            await expect(selectedPeriodButton).toBeVisible();
        });
    });

    test.describe('Metric Selection', () => {
        test('Validate buttons under Choose a metric section', async ({ page }) => {
            const cardBody = page.locator('.card__body');

            const forwardingButton = cardBody.getByRole('button', { name: `${translation.forwarding}`, exact: true });
            const avgResponseButton = cardBody.getByRole('button', { name: `${translation.averageResponseSpeedInTheInstitution}`, exact: true });
            const avgPresenceButton = cardBody.getByRole('button', { name: `${translation.averagePresenceOfCounselors}`, exact: true });
            const conversationsByAdvisorButton = cardBody.getByRole('button', { name: `${translation.numberOfConversationsByAdvisor}`, exact: true });
            const conversationTimeButton = cardBody.getByRole('button', { name: `${translation.conversationTimeByAdvisor}`, exact: true });

            await expect(forwardingButton).toBeVisible();
            await expect(avgResponseButton).toBeVisible();
            await expect(avgPresenceButton).toBeVisible();
            await expect(conversationsByAdvisorButton).toBeVisible();
            await expect(conversationTimeButton).toBeVisible();
        });
    });

    test.describe('Additional Options', () => {
        test('Validate checkboxes under Additional Options section', async ({ page }) => {
            const cardBody = page.locator('.card__body');

            const directedConversationsCheckbox = cardBody.getByLabel(`${translation.numberOfConversationsDirectedFromTheAdvisor}`, { exact: true });
            const counselorDirectedCheckbox = cardBody.getByLabel(`${translation.counselorDirectedConversations}`, { exact: true });
            const outOfFacilityCheckbox = cardBody.getByLabel(`${translation.outOfFacilityForwards}`, { exact: true });

            await expect(directedConversationsCheckbox).toBeVisible();
            await expect(counselorDirectedCheckbox).toBeVisible();
            await expect(outOfFacilityCheckbox).toBeVisible();
        });
    });

    test.describe('Forwarding Card', () => {
        test('Validate heading and buttons under Forwarding card', async ({ page }) => {
            const cardHeader = page.locator('.card__header');
            const forwardingHeading = cardHeader.getByRole('heading', { name: `${translation.forwarding}`, exact: true });
            const csvButton = page.getByRole('button', { name: `${translation.csv}`, exact: true });

            await expect(forwardingHeading).toBeVisible();
            await expect(csvButton).toBeVisible();
        });

        test('Validate dropdown options', async ({ page }) => {
            const dropdown = page.getByText(new RegExp(translation.barChart));

            await expect(dropdown).toBeVisible();
            await dropdown.click();

            const barChartOption = page.getByText('Bar Chart', { exact: true });
            const pieChartOption = page.getByText('Pie Chart', { exact: true });
            const lineChartOption = page.getByText('Line Chart', { exact: true });

            await expect(barChartOption).toBeVisible();
            await expect(pieChartOption).toBeVisible();
            await expect(lineChartOption).toBeVisible();
        });
    });
});
