const { test, expect } = require('@playwright/test');
const { getTranslations } = require('@translation/languageDetector');

test.describe('Table Sorting and Searching Automation', () => {
  let translation;

  test.beforeEach(async ({ page }) => {
    await page.goto('https://admin.prod.buerokratt.ee/training/history/history');
    translation = await getTranslations(page);
    await page.locator('table').waitFor({ state: 'visible' });
  });

  async function testSortingWorks({ page }, translationKey) {
  
    await page.waitForTimeout(2000);
    const columnName = translation[translationKey];
  
    // Get the column index based on the translated column name
    const headers = await page.locator('//table//thead//th').allTextContents();
    const columnIndex = headers.indexOf(columnName) + 1;
  
    // Get all values in the column before sorting
    const columnCells = await page.locator(`xpath=//table//tr/td[${columnIndex}]`);
    const unsortedValues = (await columnCells.allTextContents()).map(val => val.trim());
  
    // Handle empty or uniform data
    const uniqueValues = [...new Set(unsortedValues)];
    if (uniqueValues.length <= 1) {
      return;
    }
  
    // Click to sort ascending
    await page.getByRole('cell', { name: columnName, exact: true }).getByRole('button').first().click();
    await page.waitForTimeout(2000); // Adjust timeout based on actual need
  
    // Capture values after ascending sort
    const sortedAscValues = (await columnCells.allTextContents()).map(val => val.trim());

  
    // Check that the values have changed after sorting ascending
    expect(sortedAscValues).not.toEqual(unsortedValues);
  
    // Click again to sort descending
    await page.getByRole('cell', { name: columnName, exact: true }).getByRole('button').first().click();
    await page.waitForTimeout(2000); // Adjust timeout based on actual need
  
    // Capture values after descending sort
    const sortedDescValues = (await columnCells.allTextContents()).map(val => val.trim());
  

  
    // Check if sorted values are the same
    const isSameAfterSort = (sortedAscValues.length === sortedDescValues.length) &&
                            sortedAscValues.every((val, index) => val === sortedDescValues[index]);
  
    if (!isSameAfterSort) {
        // Check that the values have changed again after sorting descending
        expect(sortedDescValues).not.toEqual(sortedAscValues);
    }
  }
  

  async function searchInTableWithDropdown({ page }, column) {
    const columnName = translation[column]; // Get the translated column name

    await page.waitForTimeout(2000);
    // Select the dropdown menu and choose the option
    const dropdown = page.locator(`.select`);

    // Check if the dropdown exists
    const dropdownCount = await dropdown.count();
    if (dropdownCount === 0) {
      throw new Error(`Dropdown with name "${columnName}" not found`);
    }

    await dropdown.click();
    await page.getByRole('option', { name: columnName, exact: true }).click();

    const headers = await page.locator('//table//thead//th').allTextContents();
    const columnIndex = headers.indexOf(columnName) + 1; // Calculate column index

    // Get all rows in the table
    const rows = await page.locator('table tbody tr');
    const rowCount = await rows.count();

    if (rowCount === 0) {
      throw new Error(`No rows found in the table for column "${columnName}"`);
    }

    // Generate a random index to select a row
    const randomIndex = Math.floor(Math.random() * rowCount);
    const randomRow = rows.nth(randomIndex);

    // Get the cell value from the selected column
    const cellValue = await randomRow.locator(`td:nth-child(${columnIndex})`).innerText();

    // Use the selected cell value to fill the input field
    await page.locator('input[name="searchChats"]').fill(cellValue);
    await page.waitForTimeout(500); // Wait for search results to load

    // Verify that all visible rows show only the selected value in the specified column
    const filteredRows = await page.locator('table tbody tr'); // Get all rows after search

    const filteredRowCount = await filteredRows.count();
    // Verify if all visible rows display only the selected value in the searched column
    for (let i = 0; i < filteredRowCount; i++) {
      const row = filteredRows.nth(i);
      const rowValue = await row.locator(`td:nth-child(${columnIndex})`).innerText(); // Use column index

      // Assert that each visible row shows the selected value in the correct column
      expect(rowValue.toLowerCase()).toEqual(cellValue.toLowerCase()); // Ensure it matches the selected value
    }
  }

  async function selectDate(inputLocator, dateString, { page }) {
    // Click on the input to open the date picker
    await inputLocator.click();

    // Wait for the date picker to be visible
    const datePicker = page.locator('.react-datepicker');
    await datePicker.waitFor({ state: 'visible', timeout: 5000 });

    // Extract day, month, and year from the date string
    const [day, month, year] = dateString.split('.').map(Number);

    // Function to navigate to the correct month/year
    async function navigateToMonthYear(targetMonth, targetYear) {
      const monthMap = {
        'january': 1, 'february': 2, 'march': 3, 'april': 4, 'may': 5, 'june': 6,
        'july': 7, 'august': 8, 'september': 9, 'october': 10, 'november': 11, 'december': 12,
        // Add localized month names here
        'oktoober': 10, // Estonian for October
        // Add more month names in different languages as needed
      };

      let attempts = 0;
      const maxAttempts = 24; // Limit navigation attempts to prevent infinite loops

      while (attempts < maxAttempts) {
        const monthYearLabel = page.locator('.react-datepicker__current-month');
        await monthYearLabel.waitFor({ state: 'visible', timeout: 3000 });

        // Get the current month and year displayed in the date picker
        const currentMonthYear = await monthYearLabel.innerText();
        console.log("Current month/year label:", currentMonthYear);

        // Parse the current month and year
        let [currentMonthName, currentYear] = currentMonthYear.toLowerCase().split(' ');
        currentMonthName = currentMonthName.trim();
        currentYear = parseInt(currentYear.trim());

        // Convert the current month name to a numeric value (1-12)
        let currentMonth = monthMap[currentMonthName];

        // If month is not found in our map, try to guess based on the first few letters
        if (!currentMonth) {
          const possibleMonths = Object.entries(monthMap).filter(([key]) => key.startsWith(currentMonthName.slice(0, 3)));
          if (possibleMonths.length === 1) {
            currentMonth = possibleMonths[0][1];
          }
        }

        // If still not found, use a fallback method
        if (!currentMonth) {
          currentMonth = new Date(`${currentMonthName} 1, 2000`).getMonth() + 1;
        }

        // If the current month and year match the target, break the loop
        if (currentMonth === targetMonth && currentYear === targetYear) {
          break;
        }

        // Calculate the difference in months
        const totalMonthsDiff = (targetYear - currentYear) * 12 + (targetMonth - currentMonth);

        if (totalMonthsDiff < 0) {
          await page.locator('.react-datepicker__navigation--previous').click();
        } else {
          await page.locator('.react-datepicker__navigation--next').click();
        }
        // Add a small delay to prevent rapid clicking
        await page.waitForTimeout(300);
        attempts++;
      }

      if (attempts >= maxAttempts) {
        throw new Error("Failed to navigate to the target month/year after maximum attempts");
      }
    }

    // Navigate to the correct month/year
    await navigateToMonthYear(month, year);

    // Wait for the date picker to be visible again
    await datePicker.waitFor({ state: 'visible', timeout: 5000 });

    // Define the formatted day
    const formattedDay = day.toString().padStart(3, '0');
    const exactDaySelector = page.locator(`div.react-datepicker__day.react-datepicker__day--${formattedDay}:not(.react-datepicker__day--outside-month)`);

    // Click the first valid day element
    await exactDaySelector.first().click();

    const updatedInputLocator = page.locator(inputLocator.selector);

    // Verify the date has been set correctly
    await expect(updatedInputLocator).toHaveValue(dateString);
  }

  // Sorting test
  test.describe('Sorting Tests', () => {

    test('Sort by startTime', async ({ page }) => {
      await testSortingWorks({ page }, 'startTime');
      const dateInputs = page.locator('.react-datepicker__input-container');

      /* // Access the first two inputs which are assumed to be the date inputs
      const startDateInput = dateInputs.nth(0);
      const endDateInput = dateInputs.nth(1);
      await selectDate(startDateInput, '01.09.2024', { page });
      await selectDate(endDateInput, '31.12.2024', { page }); */
    });
  

    test('Sort by endTime', async ({ page }) => {
      await testSortingWorks({ page }, 'endTime');
    });

    test('Sort by supportName', async ({ page }) => {
      await testSortingWorks({ page }, 'supportName');
    });

    test('Sort by name', async ({ page }) => {
      await testSortingWorks({ page }, 'name');
    });

    test('Sort by idCode', async ({ page }) => {
      await testSortingWorks({ page }, 'idCode');
    });

    test('Sort by contact', async ({ page }) => {
      await testSortingWorks({ page }, 'contact');
    });

    test('Sort by comment', async ({ page }) => {
      await testSortingWorks({ page }, 'comment');
    });

    test('Sort by label', async ({ page }) => {
      await testSortingWorks({ page }, 'label');
    });

    test('Sort by status', async ({ page }) => {
      await testSortingWorks({ page }, 'status');
    });

    test('Sort by id', async ({ page }) => {
      await testSortingWorks({ page }, 'id');
    });
  });

  test.describe.fixme('Searching Tests', () => {
    test('Search by supportName', async ({ page }) => {
      await searchInTableWithDropdown({ page }, 'supportName');
    });

    test('Search by name', async ({ page }) => {
      await searchInTableWithDropdown({ page }, 'name');
    });

    test('Search by idCode', async ({ page }) => {
      await searchInTableWithDropdown({ page }, 'idCode');
    });

    test('Search by contact', async ({ page }) => {
      await searchInTableWithDropdown({ page }, 'contact');
    });

    test('Search by comment', async ({ page }) => {
      await searchInTableWithDropdown({ page }, 'comment');
    });

    test('Search by label', async ({ page }) => {
      await searchInTableWithDropdown({ page }, 'label');
    });

    test('Search by status', async ({ page }) => {
      await searchInTableWithDropdown({ page }, 'status');
    });

    test('Search by id', async ({ page }) => {
      await searchInTableWithDropdown({ page }, 'id');
    });
  });
});
