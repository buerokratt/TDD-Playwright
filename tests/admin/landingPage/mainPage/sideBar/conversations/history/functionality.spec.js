const { test, expect } = require('@playwright/test');
const { getTranslations } = require('@translation/languageDetector');
import { getColumnValues } from '../../conversations/unanswered/helper.js';
let translation;
test.describe('Buerokratt-Chatbot', () => {

  test.beforeEach(async ({ page }) => {
    test.info().annotations.push({ type: 'repository', description: 'Buerokratt-Chatbot' });
    await page.goto('https://admin.prod.buerokratt.ee/chat/history');
    translation = await getTranslations(page);
    await page.waitForTimeout(3000);
  });

  test.describe('Search functionality', () => {
    test('should filter results based on search input 1', async ({ page }) => {
      const rows = page.locator('table tbody tr');
      await expect(await rows.count()).toBeGreaterThan(0);

      const searchInput = await page.getByPlaceholder(`${translation.searchChats}`, { exact: true });
      const searchText = "Random@Text.!And+More...///Probs$%^&*";

      await searchInput.fill(searchText);
      await page.waitForTimeout(1000);

      await expect(await rows.count()).toBe(0);
    });

    test('should filter results based on search input 2', async ({ page }) => {
      const rows = page.locator('table tbody tr');
      await expect(await rows.count()).toBeGreaterThan(0);

      const idRowCell = rows.first().locator('td').nth(10);
      const searchText = await idRowCell.textContent();
      expect(searchText).toBeTruthy();

      const searchInput = await page.getByPlaceholder(`${translation.searchChats}`, { exact: true });
      await searchInput.fill(searchText);
      await expect(searchInput).toHaveValue(searchText);
      await page.waitForTimeout(1000);

      // Verify filtered results
      await expect(await rows.count()).toBeGreaterThan(0);

      // Validate each filtered row
      for (let i = 0; i < await rows.count(); i++) {
        const cellText = await rows.nth(i).locator('td').nth(10).textContent();
        expect(cellText).toContain(searchText);
      }
    });

    test('should filter results using date pickers', async ({ page }) => {
      const rows = page.locator('table tbody tr');
      await expect(await rows.count()).toBeGreaterThan(0);

      const fromDateRowCell = rows.first().locator('td').nth(0);
      const dateTime1 = await fromDateRowCell.textContent();
      expect(dateTime1).toBeTruthy();

      const toDateRowCell = rows.first().locator('td').nth(1);
      const dateTime2 = await toDateRowCell.textContent();
      expect(dateTime2).toBeTruthy();

      const date1 = dateTime1.split(' ')[0];
      const date2 = dateTime2.split(' ')[0];

      const datepickerStart = await page.locator(`.datepicker`).nth(0);
      const datepickerEnd = await page.locator(`.datepicker`).nth(1);

      const datepickerStartInput = await datepickerStart.locator('input').first();
      const datepickerEndInput = await datepickerEnd.locator('input').first();
      await datepickerStartInput.fill(date1);
      await datepickerEndInput.fill(date2);
      await page.waitForTimeout(1000);

      // Verify filtered results
      await expect(await rows.count()).toBeGreaterThan(0);

      // Validate each filtered row
      for (let i = 0; i < await rows.count(); i++) {
        const fromDateCell = await rows.nth(i).locator('td').nth(0).textContent();
        const toDateCell = await rows.nth(i).locator('td').nth(1).textContent();
        expect(fromDateCell).toContain(date1);
        expect(toDateCell).toContain(date2);
      }
    });


    test('Test Dropdown render table based on selected option/options (1 option selected)', async ({ page }) => {
      const tableHeaders = page.locator('table thead tr th');
      await expect(await tableHeaders.count()).toBe(12);

      const dropdown = await page.locator('.select');
      await expect(dropdown).toBeVisible();
      await dropdown.click();

      // select option
      const selectedOption = await page.getByRole('option', { name: `${translation.startTime}` });
      const selectedOptionText = await selectedOption.textContent();
      await selectedOption.click();

      const headerCount = await tableHeaders.count();
      expect(headerCount).toBe(2);

      const renderedHeaderText = await tableHeaders.first().textContent();
      expect(renderedHeaderText).toBe(selectedOptionText);
    });

    test('Test Dropdown render table based on selected option/options (2 options selected)', async ({ page }) => {
      const tableHeaders = page.locator('table thead tr th');
      await expect(await tableHeaders.count()).toBe(12);

      const dropdown = await page.locator('.select');
      await expect(dropdown).toBeVisible();
      await dropdown.click();

      // select options
      const selectedOptionStartTime = await page.getByRole('option', { name: `${translation.startTime}` });
      const selectedOptionEndTime = await page.getByRole('option', { name: `${translation.endTime}` });

      const selectedOptionStartTimeText = await selectedOptionStartTime.textContent();
      const selectedOptionEndTimeText = await selectedOptionEndTime.textContent();

      await selectedOptionStartTime.click();
      await selectedOptionEndTime.click();

      const headerCount = await tableHeaders.count();
      expect(headerCount).toBe(3);

      const renderedHeaderStartTimeText = await tableHeaders.first().textContent();
      expect(renderedHeaderStartTimeText).toBe(selectedOptionStartTimeText);

      const renderedHeaderEndTimeText = await tableHeaders.nth(1).textContent();
      expect(renderedHeaderEndTimeText).toBe(selectedOptionEndTimeText);
    });

    test('Test Dropdown render table based on selected option/options (5 options selected)', async ({ page }) => {
      const tableHeaders = page.locator('table thead tr th');
      await expect(await tableHeaders.count()).toBe(12);

      const dropdown = await page.locator('.select');
      await expect(dropdown).toBeVisible();
      await dropdown.click();

      // select options
      const selectedOptionStartTime = await page.getByRole('option', { name: `${translation.startTime}` });
      const selectedOptionEndTime = await page.getByRole('option', { name: `${translation.endTime}` });
      const selectedOptionSupportName = await page.getByRole('option', { name: `${translation.customerSupportName}` });
      const selectedOptionIdCode = await page.getByRole('option', { name: `${translation.idCode}` });
      const selectedOptionContact = await page.getByRole('option', { name: `${translation.contact}` });



      const selectedOptionStartTimeText = await selectedOptionStartTime.textContent();
      const selectedOptionEndTimeText = await selectedOptionEndTime.textContent();
      const selectedOptionSupportNameText = await selectedOptionSupportName.textContent();
      const selectedOptionIdCodeText = await selectedOptionIdCode.textContent();
      const selectedOptionContactText = await selectedOptionContact.textContent();

      await selectedOptionStartTime.click();
      await selectedOptionEndTime.click();
      await selectedOptionSupportName.click();
      await selectedOptionIdCode.click();
      await selectedOptionContact.click();

      await page.waitForTimeout(1000)

      const headerCount = await tableHeaders.count();
      expect(headerCount).toBe(6);

      const renderedHeaderStartTimeText = await tableHeaders.first().textContent();
      expect(renderedHeaderStartTimeText).toBe(selectedOptionStartTimeText);

      const renderedHeaderEndTimeText = await tableHeaders.nth(1).textContent();
      expect(renderedHeaderEndTimeText).toBe(selectedOptionEndTimeText);

      const renderedHeaderSupportNameText = await tableHeaders.nth(2).textContent();
      expect(renderedHeaderSupportNameText).toBe(selectedOptionSupportNameText);

      const renderedHeaderIdCodeText = await tableHeaders.nth(3).textContent();
      expect(renderedHeaderIdCodeText).toBe(selectedOptionIdCodeText);

      const renderedHeaderContactText = await tableHeaders.nth(4).textContent();
      expect(renderedHeaderContactText).toBe(selectedOptionContactText);
    });


    test('Test table elements count based on selected pagination', async ({ page }) => {

      const paginationSelect = await page.getByRole('combobox', { name: `${translation.resultCount}`, exact: true });
      const rows = page.locator('table tbody tr');

      const datepickerStart = await page.locator(`.datepicker`, { exact: true }).nth(0);
      const datepickerEnd = await page.locator(`.datepicker`, { exact: true }).nth(1);
      await expect(datepickerStart).toBeVisible();
      await expect(datepickerEnd).toBeVisible();

      const startInput = datepickerStart.locator('input').first();
      const endInput = datepickerEnd.locator('input').first();

      await startInput.fill('01.01.2000');
      await endInput.fill('31.12.2030');

      const paginationOptions = [10, 20, 30, 40, 50];

      for (const option of paginationOptions) {
        await paginationSelect.selectOption(`${option}`);
        await page.waitForTimeout(1000);
        const rowsCount = await rows.count();
        await expect(rowsCount).toBeLessThanOrEqual(option);
      }
    });
  });


  test.describe('Sorting Tests', () => {
    test('Ascending sort', async ({ page }) => {
      const tableHeaders = page.locator('table thead tr th');
      const headerCount = await tableHeaders.count();
      const rows = page.locator('table tbody tr');

      for (let i = 0; i < headerCount - 1; i++) {
        const header = await tableHeaders.nth(i);
        const button = await header.locator('button');
        await button.click();
        await page.waitForTimeout(1000);

        const orderAfterClick = await getColumnValues(rows, i);
        const sortedAscending = [...orderAfterClick].sort((a, b) => a.localeCompare(b));
        await expect(orderAfterClick).toEqual(sortedAscending);
      }
    });

    test('Descending sort', async ({ page }) => {
      const tableHeaders = page.locator('table thead tr th');
      const headerCount = await tableHeaders.count();
      const rows = page.locator('table tbody tr');

      for (let i = 0; i < headerCount - 1; i++) {
        const header = await tableHeaders.nth(i);
        const button = await header.locator('button');
        await button.click();
        await button.click();
        await page.waitForTimeout(1000);

        const orderAfterClick = await getColumnValues(rows, i);
        const sortedDescending = [...orderAfterClick].sort((a, b) => b.localeCompare(a));
        await expect(orderAfterClick).toEqual(sortedDescending);
      }
    });
  });

  test.describe('Drawer tests', () => {
    test('Clicking on view button should open drawer and close button should close it', async ({ page }) => {
      test.fail("This should be improved", 'Add aria-label to close button for better accessibility');

      const rows = page.locator('table tbody tr');
      await expect(await rows.count()).toBeGreaterThan(0);

      const viewButton = await page.getByText(`${translation.view}`, { exact: true }).first();
      await viewButton.click();

      const drawer = page.locator('.drawer');
      await expect(drawer).toBeVisible();

      const closeButton = await page.locator('.drawer__close');
      await closeButton.click();

      await expect(drawer).not.toBeVisible();
    })


  });
})
