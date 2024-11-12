// tests/working-time.spec.js
import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';
import exp from 'constants';

let translation;

test.describe('Working Time', () => {
  test.beforeEach(async ({ page }) => {
    test.info().annotations.push({ type: 'repository', description: 'Working time' });
    await page.goto('https://admin.prod.buerokratt.ee/chat/working-time');
    translation = await getTranslations(page);
    await page.waitForTimeout(3000);
  });

  test('Check main heading', async ({ page }) => {
    const heading = await page.getByRole('heading', { name: `${translation.organizationWorkingTime}`, exact: true });
    await expect(heading).toBeVisible();
  });

  test.describe('Card Header', () => {
    test('Verify switches in header', async ({ page }) => {
      const workingHoursSwitch = await page.getByLabel(`${translation.workingHoursAre247}`, { exact: true });
      await expect(workingHoursSwitch).toBeVisible();

      const isChecked = await workingHoursSwitch.getAttribute('aria-checked');
      if (isChecked === 'true') {
        await workingHoursSwitch.click();
      }

      const publicHolidaysSwitch = await page.getByText(`${translation.considerPublicHolidays}`, { exact: true });
      await expect(publicHolidaysSwitch).toBeVisible();

      const weekendsSwitch = await page.getByText(`${translation.closedOnWeekends}`, { exact: true });
      await expect(weekendsSwitch).toBeVisible();

      const allDaysSwitch = await page.getByText(`${translation.sameOnAllWorkingDays}`, { exact: true });
      await expect(allDaysSwitch).toBeVisible();
    });
  });

  test.describe('Card Body', () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    for (const day of days) {
      test(`Check inputs for ${day}`, async ({ page }) => {
        const workingHoursSwitch = await page.getByLabel(`${translation.workingHoursAre247}`, { exact: true });
        const isChecked = await workingHoursSwitch.getAttribute('aria-checked');
        if (isChecked === 'true') {
          await workingHoursSwitch.click();
        }


        const dayLabel = await page.getByText(`${translation[day.toLowerCase()]}`, { exact: true });
        await expect(dayLabel).toBeVisible();

        const track = page.locator(`.track:has-text("${translation[day.toLowerCase()]}")`);
        const daySwitch = track.getByRole('switch')
        expect(daySwitch).toBeVisible();

        
        const isDaySwitchChecked = await daySwitch.getAttribute('aria-checked');
        if (isDaySwitchChecked !== 'true') {
          await daySwitch.click();
        }

        const startTimeInput = track.locator('input[type="text"]').nth(0);  
        const endTimeInput = track.locator('input[type="text"]').nth(1);     

        await expect(startTimeInput).toBeVisible();
        await expect(endTimeInput).toBeVisible();


      });
    }
  });

  test.describe('Card Footer', () => {
    test('Check save button', async ({ page }) => {
      const saveButton = await page.getByText(`${translation.save}`, { exact: true });
      await expect(saveButton).toBeVisible();
    });
  });

  test('Check absence notifications', async ({ page }) => {
    const absenceNotificationSwitch = await page.getByText(`${translation.sendANotificationOfAbsenceToTheClient}`, { exact: true });
    await expect(absenceNotificationSwitch).toBeVisible();

    const contactRequestSwitch = await page.getByText(`${translation.sendANotificationOfAbsenceToTheClientWithAContactRequest}`, { exact: true });
    await expect(contactRequestSwitch).toBeVisible();
  });

  test('Check No CSA message input', async ({ page }) => {
    const noCsaMessageInput = await page.getByLabel(`${translation.noCsaAvailableMessage}`, { exact: true });
    await expect(noCsaMessageInput).toBeVisible();
  });
});
