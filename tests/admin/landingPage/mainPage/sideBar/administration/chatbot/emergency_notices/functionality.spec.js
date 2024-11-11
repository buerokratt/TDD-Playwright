import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';
import {formatDate} from '../../../conversations/unanswered/helper.js';
test.describe('Erakorralised Teated/Emergency notices Functionality Tests', () => {

  let translation

  test.beforeEach(async ({ page }) => {
    await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/emergency-notices');
    translation = await getTranslations(page)
    await page.waitForTimeout(3000);
  });

  test('Toggle "Notice Active" switch', async ({ page }) => {
    const noticeActiveSwitch = page.getByRole('switch', { name: `${translation.noticeActive}`, exact: true });
    if (await noticeActiveSwitch.getAttribute('data-state') === 'checked') {
      await noticeActiveSwitch.click();
    }
    await expect(noticeActiveSwitch).toHaveAttribute('data-state', 'unchecked');
    await noticeActiveSwitch.click();
    await expect(noticeActiveSwitch).toHaveAttribute('data-state', 'checked');

  });


  test('Fill in "Notice" text area', async ({ page }) => {
    const noticeTextarea = page.getByLabel(`${translation.notice}`, { exact: true });
    const noticeText = 'This is a test emergency notice.';

    await noticeTextarea.fill(noticeText);
    await expect(noticeTextarea).toHaveValue(noticeText);
  });

  test('Open and verify "Display Period From" date picker', async ({ page }) => {
    const input = await page.getByRole('textbox').nth(1);

    await input.click();

    const datePicker = page.locator('.react-datepicker__month-container');
    await expect(datePicker).toBeVisible();
  });

  test('Open and verify "Display Period To" date picker', async ({ page }) => {
    const input = await page.getByRole('textbox').nth(2);

    await input.click();

    const datePicker = page.locator('.react-datepicker__month-container');
    await expect(datePicker).toBeVisible();
  });

  test.skip('Check if "Kuvamisperiood" date inputs can be changed ### Look issues inside', async ({ page }) => {

    test.info().annotations.push({
      type: 'Known critical bug',
      description: 'When selecting the whole startDate or endDate input and pressing backspace(deleting it), it clears the whole sites HTML',
    })

    test.info().annotations.push({
      type: 'Known critical bug',
      description: 'When selecting the whole startDate or endDate input and typing 123456, it clears the whole HTML',
    })

    const fromInput = await page.getByRole('textbox').nth(1);
    const toInput = await page.getByRole('textbox').nth(2);

    await fromInput.click({ clickCount: 3 });
    await fromInput.fill('01.09.2023');
    await expect(fromInput).toHaveValue('01.09.2023');

    await toInput.click({ clickCount: 3 });
    await toInput.fill('31.12.2024');
    await expect(toInput).toHaveValue('31.12.2024');
  });


  test.only('Check if "Kuvamisperiood"/"Display period" dates can be changed by choosing a date', async ({ page }) => {

    test.info().annotations.push({
      type: 'bug',
      description: 'Shouldnt be able to set either of the dates in the past or in bad relation (start date later than end date) to one another. Currently its possible on the frontend.',
    })

    const fromInput = await page.getByRole('textbox').nth(1);
    const toInput = await page.getByRole('textbox').nth(2);

    await fromInput.click({ clickCount: 3 });
    await fromInput.fill('01.09.2024');

    await toInput.click({ clickCount: 3 });
    await toInput.fill('01.09.2024');


    await fromInput.click();
    let validStartDateLabel = "Choose reede, 6. september 2024";

    await page.locator(`[aria-label="${validStartDateLabel}"]`).click();

    await expect(fromInput).toHaveValue("06.09.2024");


    await toInput.click();

    let validEndDateLabel = "Choose laupäev, 7. september 2024";

    await page.locator(`[aria-label="${validEndDateLabel}"]`).click();

    await expect(toInput).toHaveValue("07.09.2024");
  });

  test('Check if "Salvesta"/"Save" button can be clicked', async ({ page }) => {

    const saveButton = await page.locator(`button:has-text("${translation["save"]}")`);

    await saveButton.click();

    await expect(page.locator('.toast.toast--success')).toBeVisible();
  });

});
