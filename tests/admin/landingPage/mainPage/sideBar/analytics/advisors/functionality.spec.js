import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Functionality Testing Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://admin.prod.buerokratt.ee/analytics/advisors');
    translation = await getTranslations(page);
    test.info().annotations.push({ type: 'repository', description: 'Functionality Testing' });
    await page.waitForTimeout(3000);
  });

  test('should display and edit display period date pickers', async ({ page }) => {
    const selectedPeriodButton = page.getByRole('button', { name: `${translation.selectedPeriod}`, exact: true });
    await selectedPeriodButton.click();
    const startDatePicker = page.locator('.datepicker').nth(0);
    const endDatePicker = page.locator('.datepicker').nth(1);

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

  test('should toggle additional options checkboxes', async ({ page }) => {
    const additionalOptionsSection = page.locator('.card__body').filter({ hasText: `${translation.additionalOptions}` });
    const checkbox1 = additionalOptionsSection.getByRole('checkbox', { name: `${translation.numberOfConversationsDirectedFromTheAdvisor}`, exact: true });
    const checkbox2 = additionalOptionsSection.getByRole('checkbox', { name: `${translation.counselorDirectedConversations}`, exact: true });
    const checkbox3 = additionalOptionsSection.getByRole('checkbox', { name: `${translation.outOfFacilityForwards}`, exact: true });

    await checkbox1.check();
    await expect(checkbox1).not.toBeChecked();
    await checkbox1.uncheck();
    await expect(checkbox1).toBeChecked();

    await checkbox2.check();
    await expect(checkbox2).not.toBeChecked();
    await checkbox2.uncheck();
    await expect(checkbox2).toBeChecked();

    await checkbox3.check();
    await expect(checkbox3).not.toBeChecked();
    await checkbox3.uncheck();
    await expect(checkbox3).toBeChecked();
  });

  test('should test CSV download button', async ({ page }) => {
    const csvButton = page.getByRole('button', { name: `${translation.csv}`, exact: true });
    await csvButton.click();
    const download = await page.waitForEvent('download');
    expect(download.suggestedFilename()).toMatch(/.*\.csv/);
  });


  test('should test dropdown selection', async ({ page }) => {
    const dropdown = page.getByText(new RegExp(translation.barChart));
    await dropdown.click();

    const pieChartOption = page.getByText(`${translation.pieChart}`);
    await pieChartOption.click();

    const selectedOption = page.getByText(`${translation.pieChart}`);
    await expect(selectedOption).toBeVisible();
  });
});
