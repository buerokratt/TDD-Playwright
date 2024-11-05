import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

test.describe('Erakorralised Teated/Emergency notices Functionality Tests', () => {

  let translation

  test.beforeEach(async ({ page }) => {
    await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/emergency-notices'); // Replace with your actual page URL
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
    const displayPeriodFromInput = page.getByLabel(`${translation.displayPeriod}`, { exact: true });

    await displayPeriodFromInput.click();

    const datePicker = page.locator('.react-datepicker__month-container'); 
    await expect(datePicker).toBeVisible();
  });

  test('Open and verify "Display Period To" date picker', async ({ page }) => {
    const displayPeriodToInput = page.getByLabel(`${translation.to}`, { exact: true });
    
    await displayPeriodToInput.click();
    
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

    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');

    // Locate the main container that holds the inputs
    const container = page.locator('.card__body');

    // Select all input fields inside the main container
    const dateInputs = container.locator('input');

    // Access the first two inputs which are assumed to be the date inputs
    const startDateInput = dateInputs.nth(0);
    const endDateInput = dateInputs.nth(1);

    // Clear and set the start date
    await startDateInput.click({ clickCount: 3 }); // Select all text
    await startDateInput.fill('01.09.2023'); // Set new date
    await expect(startDateInput).toHaveValue('01.09.2023'); // Assert new value

    // Clear and set the end date
    await endDateInput.click({ clickCount: 3 }); // Select all text
    await endDateInput.fill('31.12.2024'); // Set new date
    await expect(endDateInput).toHaveValue('31.12.2024'); // Assert new value
  });


  test('Check if "Kuvamisperiood"/"Display period" dates can be changed by choosing a date', async ({ page }) => {

    test.info().annotations.push({
      type: 'bug',
      description: 'Shouldnt be able to set either of the dates in the past or in bad relation (start date later than end date) to one another. Currently its possible on the frontend.',
    })


    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');

    // Locate the main container that holds the inputs
    const container = page.locator('.card__body');

    // Select all input fields inside the main container
    const dateInputs = container.locator('input');

    // Access the first two inputs which are assumed to be the date inputs
    const startDateInput = dateInputs.nth(0);
    const endDateInput = dateInputs.nth(1);

    // Function to select a date from the date picker
    async function selectDate(inputLocator, dateString) {
      // Click on the input to open the date picker
      await inputLocator.click();

      // Wait for the date picker to be visible
      const datePicker = page.locator('.react-datepicker');
      await datePicker.waitFor({ state: 'visible', timeout: 5000 });

      // Extract day, month, and year from the date string
      const [day, month, year] = dateString.split('.').map(Number);

      // Get the month name in Estonian for the date picker
      const monthName = new Date(year, month - 1).toLocaleString('et', { month: 'long' });

      // Function to navigate to the correct month/year
      async function navigateToMonthYear(targetMonth, targetYear) {
        while (true) {
          const monthYearLabel = page.locator('.react-datepicker__current-month');
          await monthYearLabel.waitFor({ state: 'visible', timeout: 3000 });
          const currentMonthYear = await monthYearLabel.innerText();

          if (currentMonthYear.includes(targetMonth) && currentMonthYear.includes(targetYear.toString())) {
            break;
          }

          const navigationButton = (currentMonthYear.includes(targetYear.toString()) && currentMonthYear.includes(targetMonth))
            ? null
            : (targetYear < currentYear || (targetYear === currentYear && targetMonth < currentMonth))
              ? page.locator('.react-datepicker__navigation--previous')
              : page.locator('.react-datepicker__navigation--next');

          if (navigationButton) {
            await navigationButton.click();
          } else {
            break;
          }
        }
      }

      // Get current month and year
      const currentMonthYearLabel = page.locator('.react-datepicker__current-month');
      const currentMonthYearText = await currentMonthYearLabel.innerText();
      const [currentMonth, currentYear] = currentMonthYearText.split(' ');

      // Navigate to the correct month/year
      await navigateToMonthYear(monthName, year);

      await page.locator('.react-datepicker').waitFor({ state: 'visible', timeout: 5000 });

      // Define the formatted day
      const formattedDay = day < 10 ? `00${day}` : day < 100 ? `0${day}` : `${day}`;
      const exactDaySelector = page.locator(`div.react-datepicker__day.react-datepicker__day--${formattedDay}:not(.react-datepicker__day--outside-month)`);

      // Wait for the first valid day element to be visible
      await exactDaySelector.first().waitFor({ state: 'visible', timeout: 5000 });

      // Click the first valid day element
      await exactDaySelector.first().click();

      // Verify the date has been set correctly
      await expect(inputLocator).toHaveValue(dateString);
    }

    // Test setting start date
    await selectDate(startDateInput, '01.09.2024');

    // Test setting end date
    await selectDate(endDateInput, '31.12.2024');
  });

  test('Check if "Salvesta"/"Save" button can be clicked', async ({ page }) => {
    // Locate the "Salvesta" button using its text

    const saveButton = await page.locator(`button:has-text("${translation["save"]}")`);

    // Click the "Salvesta" button
    await saveButton.click();

    // Verify that the success toast is visible after clicking the button
    await expect(page.locator('.toast.toast--success')).toBeVisible();
  });

});
