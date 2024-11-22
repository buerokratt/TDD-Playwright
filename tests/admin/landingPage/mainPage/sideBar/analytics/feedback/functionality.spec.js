import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Functionality Testing Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://admin.prod.buerokratt.ee/analytics/feedback');
    translation = await getTranslations(page);
    test.info().annotations.push({ type: 'repository', description: 'Analytics-Module' });
    await page.waitForTimeout(3000);
  });

  test('should display and edit display period date pickers', async ({ page }) => {
    const cardBody = page.locator('.card__body').filter({ hasText: `${translation.period}` });
    const selectedPeriodButton = cardBody.getByRole('button', { name: `${translation.selectedPeriod}`, exact: true });
    await selectedPeriodButton.click();
    const startDatePicker = cardBody.locator('.datepicker').nth(0);
    const endDatePicker = cardBody.locator('.datepicker').nth(1);

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

  test('should interact with period buttons', async ({ page }) => {
    const cardBody = page.locator('.card__body').filter({ hasText: `${translation.period}` });
    const todayButton = cardBody.getByRole('button', { name: `${translation.today}`, exact: true });
    const yesterdayButton = cardBody.getByRole('button', { name: `${translation.yesterday}`, exact: true });
    const last30DaysButton = cardBody.getByRole('button', { name: `${translation.last30Days}`, exact: true });
    const selectedMonthsButton = cardBody.getByRole('button', { name: `${translation.selectedMonths}`, exact: true });

    await todayButton.click();
    await expect(todayButton).toBeEnabled();

    await yesterdayButton.click();
    await expect(yesterdayButton).toBeEnabled();

    await last30DaysButton.click();
    await expect(last30DaysButton).toBeEnabled();

    await selectedMonthsButton.click();
    await expect(selectedMonthsButton).toBeEnabled();
  });

  test('should test metrics buttons functionality', async ({ page }) => {
    const metricsSection = page.locator('.card__body').filter({ hasText: `${translation.chooseAMetric}` });
    const feedbackOnBureaucratButton = metricsSection.getByRole('button', { name: `${translation.feedbackOnBureaucratConversations}`, exact: true });
    const feedbackOnAdvisorButton = metricsSection.getByRole('button', { name: `${translation.feedbackOnAdvisorConversations}`, exact: true });

    await feedbackOnBureaucratButton.click();
    await expect(feedbackOnBureaucratButton).toBeEnabled();

    await feedbackOnAdvisorButton.click();
    await expect(feedbackOnAdvisorButton).toBeEnabled();
  });

  test('should toggle additional options checkboxes', async ({ page }) => {
    const additionalOptionsSection = page.locator('.card__body').filter({ hasText: `${translation.additionalOptions}` });
    const checkbox1 = additionalOptionsSection.getByRole('checkbox', { name: `${translation.bureaucratClientLeftWithAnswer}`, exact: true });
    const checkbox2 = additionalOptionsSection.getByRole('checkbox', { name: `${translation.advisorSignsOfHateSpeech}`, exact: true });

    await checkbox1.check();
    await expect(checkbox1).toBeChecked();

    await checkbox2.check();
    await expect(checkbox2).toBeChecked();

    await checkbox1.uncheck();
    await expect(checkbox1).not.toBeChecked();

    await checkbox2.uncheck();
    await expect(checkbox2).not.toBeChecked();
  });

  test('should select dropdown options', async ({ page }) => {
    const dropdown = page.getByText(new RegExp(translation.barChart));
    await dropdown.click();
    const pieChartOption = page.getByText(`${translation.pieChart}`);
    await pieChartOption.click();
    await expect(pieChartOption).toBeVisible();
  });

  test('should test CSV download button', async ({ page }) => {
    const csvButton = page.getByRole('button', { name: `${translation.csv}`, exact: true });
    await csvButton.click();
    const download = await page.waitForEvent('download');
    expect(download.suggestedFilename()).toMatch(/.*\.csv/);
  });

  test('should validate chart visibility in card body', async ({ page }) => {
    const chart = page.locator('.recharts-wrapper');
    await expect(chart).toBeVisible();
  });
});
