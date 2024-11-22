import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Analytics-Module Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://admin.prod.buerokratt.ee/analytics/advisors');
    translation = await getTranslations(page);
    test.info().annotations.push({ type: 'repository', description: 'Analytics-Module' });
    await page.waitForTimeout(3000);
  });

  test('Validate Advisors Heading', async ({ page }) => {
    const heading = await page.getByRole('heading', { name: `${translation.advisors}`, exact: true });
    await expect(heading).toBeVisible();
  });

  test('Validate Period Buttons in Card Section', async ({ page }) => {
    const cardSection = page.locator('.card__body').filter({ hasText: `${translation.period}` });
    const todayButton = await cardSection.getByRole('button', { name: `${translation.today}`, exact: true });
    const yesterdayButton = await cardSection.getByRole('button', { name: `${translation.yesterday}`, exact: true });
    const last30DaysButton = await cardSection.getByRole('button', { name: `${translation.last30Days}`, exact: true });
    const selectedMonthsButton = await cardSection.getByRole('button', { name: `${translation.selectedMonths}`, exact: true });
    const selectedPeriodButton = await cardSection.getByRole('button', { name: `${translation.selectedPeriod}`, exact: true });

    await expect(todayButton).toBeVisible();
    await expect(yesterdayButton).toBeVisible();
    await expect(last30DaysButton).toBeVisible();
    await expect(selectedMonthsButton).toBeVisible();
    await expect(selectedPeriodButton).toBeVisible();
  });

  test('Validate Datepicker Functionality', async ({ page }) => {
    const selectedPeriodButton = page.getByRole('button', { name: `${translation.selectedPeriod}`, exact: true });
    await selectedPeriodButton.click();
    const startDatepicker = page.locator('.datepicker').nth(0);
    const endDatepicker = page.locator('.datepicker').nth(1);
    await expect(startDatepicker).toBeVisible();
    await expect(endDatepicker).toBeVisible();
  });

  test('Validate Metrics Section Buttons', async ({ page }) => {
    const metricsSection = page.locator('.card__body').filter({ hasText: `${translation.chooseAMetric}` });
    const forwardingButton = await metricsSection.getByRole('button', { name: `${translation.forwarding}`, exact: true });
    const avgResponseSpeedButton = await metricsSection.getByRole('button', { name: `${translation.averageResponseSpeedInTheInstitution}`, exact: true });
    const avgPresenceButton = await metricsSection.getByRole('button', { name: `${translation.averagePresenceOfCounselors}`, exact: true });
    const numConversationsButton = await metricsSection.getByRole('button', { name: `${translation.numberOfConversationsByAdvisor}`, exact: true });
    const conversationTimeButton = await metricsSection.getByRole('button', { name: `${translation.conversationTimeByAdvisor}`, exact: true });

    await expect(forwardingButton).toBeVisible();
    await expect(avgResponseSpeedButton).toBeVisible();
    await expect(avgPresenceButton).toBeVisible();
    await expect(numConversationsButton).toBeVisible();
    await expect(conversationTimeButton).toBeVisible();
  });

  test('Validate Additional Options Checkboxes', async ({ page }) => {
    const additionalOptionsSection = page.locator('.card__body').filter({ hasText: `${translation.additionalOptions}` });
    const checkbox1 = await additionalOptionsSection.getByRole('checkbox', { name: `${translation.numberOfConversationsDirectedFromTheAdvisor}`, exact: true });
    const checkbox2 = await additionalOptionsSection.getByRole('checkbox', { name: `${translation.counselorDirectedConversations}`, exact: true });
    const checkbox3 = await additionalOptionsSection.getByRole('checkbox', { name: `${translation.outOfFacilityForwards}`, exact: true });

    await expect(checkbox1).toBeVisible();
    await expect(checkbox2).toBeVisible();
    await expect(checkbox3).toBeVisible();
  });

  test('Validate Forwarding Card Heading', async ({ page }) => {
    const heading = await page.getByRole('heading', { name: `${translation.forwarding}`, exact: true });
    await expect(heading).toBeVisible();
  });

  test('Validate CSV Button and Dropdown in Other Content', async ({ page }) => {
    const csvButton = await page.getByRole('button', { name: `${translation.csv}`, exact: true });
    const dropdown = await page.getByText(new RegExp(translation.barChart));
    await expect(csvButton).toBeVisible();
    await expect(dropdown).toBeVisible();
  });

  test('Validate Presence of Chart in Card Body', async ({ page }) => {
    const cardBody = page.locator('.card__body');
    const chart = cardBody.locator('.recharts-wrapper');
    await expect(chart).toBeVisible();
  });
});
