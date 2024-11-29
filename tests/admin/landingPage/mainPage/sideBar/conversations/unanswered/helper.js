import { request } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';
export async function selectFirstItem(page) {
    const buttons = await page.locator('.vertical-tabs__trigger');
    const buttonCount = await buttons.count();
    if (buttonCount === 0) {
        return false;
    }
    await page.waitForTimeout(2000);
    await buttons.first().click();
    return true;
}

export async function turnSwitchOn(page) {
    const switchButton = await page.locator('.switch__button');
    const isChecked = await switchButton.getAttribute('aria-checked');
    if (isChecked !== 'true') {
        await switchButton.click();
    }
}


export async function turnSwitchOff(page) {
    const switchButton = await page.locator('.switch__button');
    const isChecked = await switchButton.getAttribute('aria-checked');
    if (isChecked === 'true') {
        await switchButton.click();
    }
}

export async function letQuestion(page) {
    await page.goto('https://prod.buerokratt.ee');
    await page.getByLabel('Ava vestlus').click();

    await page.getByPlaceholder('Kirjutage oma sõnum...').fill('Suuna mind');
    const sendButton = page.getByLabel('Saada');
    await sendButton.click();
    await page.waitForTimeout(6000);

    await page.getByPlaceholder('nimi@email.ee').fill('asd@gmail.com');
    await page.getByPlaceholder('+372 123 456').fill('55675567');
    await page.getByPlaceholder('Täpsustage siin oma küsimust').fill('Kui suur on tulumaks?');
    await page.getByText('Kinnita').click();
    await page.waitForTimeout(2000);
}

export async function provideData() {

    //console.log("No unanswered chats, making API request...");

    // Prepare the JSON data
    const jsonData = {
        "message": {
            "chatId": "",
            "content": "suuna mind",
            "authorTimestamp": new Date().toISOString(),  // Using the current timestamp
            "authorRole": "end-user"
        },
        "endUserTechnicalData": {
            "endUserUrl": "https://prod.buerokratt.ee/",
            "endUserOs": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
        },
        "holidays": [
            "2024-01-01",
            "2024-02-24",
            "2024-03-29",
            "2024-03-31",
            "2024-05-01",
            "2024-05-19",
            "2024-06-23",
            "2024-06-24",
            "2024-08-20",
            "2024-12-24",
            "2024-12-25",
            "2024-12-26"
        ],
        "holidayNames": "2024-01-01-uusaasta,2024-02-24-iseseisvuspäev,2024-03-29-suur reede,2024-03-31-lihavõtted,2024-05-01-kevadpüha,2024-05-19-nelipühade 1. püha,2024-06-23-võidupüha,2024-06-24-jaanipäev,2024-08-20-taasiseseisvumispäev,2024-12-24-jõululaupäev,2024-12-25-esimene jõulupüha,2024-12-26-teine jõulupüha"
    };


    // Create a new API request context
    const apiRequestContext = await request.newContext();

    // Send the POST request
    const response = await apiRequestContext.post('https://ruuter.prod.buerokratt.ee/v2/public/backoffice/chats/init', {
        headers: {
            'Content-Type': 'application/json',
        },
        data: jsonData
    });

    // Check the response status and handle errors if necessary
    if (response.ok()) {
        //console.log('API request was successful.');
    } else {
        console.error(`API request failed with status: ${response.status()}`);
    }

    // Close the request context to avoid memory leaks
    await apiRequestContext.dispose();
}

export async function changeOpenHoursTo24and7() {
    const jsonData =
    {
        "organizationMondayWorkingTimeStartISO": "2023-10-22T09:00:00.000Z",
        "organizationMondayWorkingTimeEndISO": "2023-10-22T17:00:00.000Z",
        "organizationTuesdayWorkingTimeStartISO": "2023-10-22T09:00:00.000Z",
        "organizationTuesdayWorkingTimeEndISO": "2023-10-22T17:00:00.000Z",
        "organizationWednesdayWorkingTimeStartISO": "2023-10-22T09:00:00.000Z",
        "organizationWednesdayWorkingTimeEndISO": "2023-10-22T17:00:00.000Z",
        "organizationThursdayWorkingTimeStartISO": "2023-10-22T09:00:00.000Z",
        "organizationThursdayWorkingTimeEndISO": "2023-10-22T17:00:00.000Z",
        "organizationFridayWorkingTimeStartISO": "2023-10-22T09:00:00.000Z",
        "organizationFridayWorkingTimeEndISO": "2023-10-22T17:00:00.000Z",
        "organizationSaturdayWorkingTimeStartISO": "2023-10-22T09:00:00.000Z",
        "organizationSaturdayWorkingTimeEndISO": "2023-10-22T17:00:00.000Z",
        "organizationSundayWorkingTimeStartISO": "2023-10-22T09:00:00.000Z",
        "organizationSundayWorkingTimeEndISO": "2023-10-22T17:00:00.000Z",
        "organizationAllWeekdaysTimeStartISO": "2023-10-22T09:00:00.000Z",
        "organizationAllWeekdaysTimeEndISO": "2023-10-22T17:00:00.000Z",
        "organizationClosedOnWeekEnds": "false",
        "organizationTheSameOnAllWorkingDays": "false",
        "organizationWorkingTimeNationalHolidays": "true",
        "organizationWorkingTimeWeekdays": "monday,tuesday,wednesday,thursday,friday,saturday,sunday",
        "organizationWorkingAllTime": "true",
        "organizationNoCsaAskForContacts": "true",
        "organizationNoCsaAvailableMessage": "Hetkel ei ole ühtegi vaba klienditeenindajat, palun proovige mõne aja pärast uuesti"
    }

    const apiRequestContext = await request.newContext();
    const response = await apiRequestContext.post('https://ruuter.prod.buerokratt.ee/v2/private/backoffice/configs/organization-working-time', {
        headers: {
            'Content-Type': 'application/json',
        },
        data: jsonData
    });

    if (response.ok()) {
    } else {
        console.error(`API request failed with status: ${response.status()}`);
    }
    await apiRequestContext.dispose();
}


export async function changeOpenHoursToClosed() {
    const jsonData =
    {
        "organizationMondayWorkingTimeStartISO": "2023-10-22T09:00:00.000Z",
        "organizationMondayWorkingTimeEndISO": "2023-10-22T17:00:00.000Z",
        "organizationTuesdayWorkingTimeStartISO": "2023-10-22T09:00:00.000Z",
        "organizationTuesdayWorkingTimeEndISO": "2023-10-22T17:00:00.000Z",
        "organizationWednesdayWorkingTimeStartISO": "2023-10-22T09:00:00.000Z",
        "organizationWednesdayWorkingTimeEndISO": "2023-10-22T17:00:00.000Z",
        "organizationThursdayWorkingTimeStartISO": "2023-10-22T09:00:00.000Z",
        "organizationThursdayWorkingTimeEndISO": "2023-10-22T17:00:00.000Z",
        "organizationFridayWorkingTimeStartISO": "2023-10-22T09:00:00.000Z",
        "organizationFridayWorkingTimeEndISO": "2023-10-22T17:00:00.000Z",
        "organizationSaturdayWorkingTimeStartISO": "2023-10-22T09:00:00.000Z",
        "organizationSaturdayWorkingTimeEndISO": "2023-10-22T17:00:00.000Z",
        "organizationSundayWorkingTimeStartISO": "2023-10-22T09:00:00.000Z",
        "organizationSundayWorkingTimeEndISO": "2023-10-22T17:00:00.000Z",
        "organizationAllWeekdaysTimeStartISO": "2023-10-22T09:00:00.000Z",
        "organizationAllWeekdaysTimeEndISO": "2023-10-22T17:00:00.000Z",
        "organizationClosedOnWeekEnds": "false",
        "organizationTheSameOnAllWorkingDays": "false",
        "organizationWorkingTimeNationalHolidays": "true",
        "organizationWorkingTimeWeekdays": "",
        "organizationWorkingAllTime": "false",
        "organizationNoCsaAskForContacts": "true",
        "organizationNoCsaAvailableMessage": "Hetkel ei ole ühtegi vaba klienditeenindajat, palun proovige mõne aja pärast uuesti"
    }

    const apiRequestContext = await request.newContext();
    const response = await apiRequestContext.post('https://ruuter.prod.buerokratt.ee/v2/private/backoffice/configs/organization-working-time', {
        headers: {
            'Content-Type': 'application/json',
        },
        data: jsonData
    });

    if (response.ok()) {
    } else {
        console.error(`API request failed with status: ${response.status()}`);
    }
    await apiRequestContext.dispose();
}


export async function takeOverFirstChat(page) {
    const translation = await getTranslations(page);
    const chatOpened = await selectFirstItem(page);

    const takeOverButton = await page.locator(`button:has-text("${translation.takeOver}")`);

    return await takeOverButton.isVisible() ? (await takeOverButton.click(), true) : false;
}


export function formatDate(date) {
    return date.toLocaleDateString('et-EE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

/**
* Helper function to get all values from a specific column
* @param {Locator} rows - Locator for the table rows
* @param {number} columnIndex - Index of the column to extract
* @returns {Promise<string[]>} - Array of column values
*/
export async function getColumnValues(rows, columnIndex) {
    const rowCount = await rows.count();
    const columnValues = [];

    for (let i = 0; i < rowCount; i++) {
        const cellText = await rows.nth(i).locator('td').nth(columnIndex).textContent();
        columnValues.push(cellText ? cellText.trim() : '');
    }
    return columnValues;
}



