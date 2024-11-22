import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Analytics-Module', () => {
  test.beforeEach(async ({ page }) => {
    test.info().annotations.push({ type: 'repository', description: 'Analytics-Module' });

    await page.goto('https://admin.prod.buerokratt.ee/analytics/chats');
    translation = await getTranslations(page);

    await page.waitForTimeout(3000);
  });

  test.describe('Main Heading', () => {
    test('should display main heading', async ({ page }) => {
      const heading = await page.getByRole('heading', { name: `${translation.chats}`, exact: true });
      await expect(heading).toBeVisible();
    });
  });

  test.describe('Period Section', () => {
    test('should display Period label and buttons', async ({ page }) => {
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
    });

    test('should open datepickers for Selected Period button', async ({ page }) => {
      const selectedPeriodButton = await page.getByRole('button', { name: `${translation.selectedPeriod}`, exact: true });
      await selectedPeriodButton.click();

      const datepickerStart = await page.locator('.datepicker', { exact: true }).nth(0);
      const datepickerEnd = await page.locator('.datepicker', { exact: true }).nth(1);

      const datepickerStartInput = await datepickerStart.locator('input').first();
      const datepickerEndInput = await datepickerEnd.locator('input').first();

      await expect(datepickerStartInput).toBeVisible();
      await expect(datepickerEndInput).toBeVisible();
    });
  });

  test.describe('Metrics Section', () => {
    test('should display Choose a metric label and metric buttons', async ({ page }) => {
      const metricLabel = await page.getByText(`${translation.chooseAMetric}`, { exact: true });
      await expect(metricLabel).toBeVisible();

      const totalChatsButton = await page.getByRole('button', { name: `${translation.totalNumberOfChats}`, exact: true });
      const contactInfoButton = await page.getByRole('button', { name: `${translation.contactInformationProvided}`, exact: true });
      const avgConvTimeButton = await page.getByRole('button', { name: `${translation.averageConversationTimeMin}`, exact: true });
      const avgWaitTimeButton = await page.getByRole('button', { name: `${translation.averageWaitingTimeMin}`, exact: true });
      const avgMessagesButton = await page.getByRole('button', { name: `${translation.averageNumberOfMessagesInAChat}`, exact: true });
      const idleChatsButton = await page.getByRole('button', { name: `${translation.countOfIdleChatsEndedByBuerokratt}`, exact: true });

      await expect(totalChatsButton).toBeVisible();
      await expect(contactInfoButton).toBeVisible();
      await expect(avgConvTimeButton).toBeVisible();
      await expect(avgWaitTimeButton).toBeVisible();
      await expect(avgMessagesButton).toBeVisible();
      await expect(idleChatsButton).toBeVisible();
    });
  });

  test.describe('Additional Options Section', () => {
    test('should display Additional Options label and checkboxes', async ({ page }) => {
      const additionalOptionsLabel = await page.getByText(`${translation.additionalOptions}`, { exact: true });
      await expect(additionalOptionsLabel).toBeVisible();

      const burokrattCheckbox = await page.getByRole('checkbox', { name: `${translation.onlyBuerokrattInvolved}`, exact: true });
      const csaCheckbox = await page.getByRole('checkbox', { name: `${translation.csaInvolved}`, exact: true });
      const totalCheckbox = await page.getByRole('checkbox', { name: `${translation.total}`, exact: true });

      await expect(burokrattCheckbox).toBeVisible();
      await expect(csaCheckbox).toBeVisible();
      await expect(totalCheckbox).toBeVisible();
    });
  });

  test.describe('Header and Chart Controls', () => {
    test('should display header and chart controls', async ({ page }) => {
      const header = await page.getByRole('heading', { name: `${translation.totalNumberOfChats}`, exact: true });
      await expect(header).toBeVisible();

      const csvButton = await page.getByRole('button', { name: `${translation.csv}`, exact: true });
      const dropdown = await page.getByText(new RegExp(translation.barChart));

      await expect(csvButton).toBeVisible();
      await expect(dropdown).toBeVisible();
    });
  });
});
