import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';
import {
    turnSwitchOn,
    turnSwitchOff
} from '../../sideBar/conversations/unanswered/helper';

let translation;

test.describe("user profile/drawer visibility", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://admin.prod.buerokratt.ee/chat/active');
        await page.waitForTimeout(1000);
        await page.getByRole('button', { name: "Ajutine" }).click();

        await expect(page.locator('.drawer')).toBeVisible();
        translation = await getTranslations(page)
    });

    test("should diplay red status indicator if switch is not active (user is not present)", async ({ page }) => {
        await turnSwitchOff(page);

        await page.waitForTimeout(1000);

        const button = await page.getByRole('button', { name: 'Ajutine' })
        const redSpan = await button.locator('span').first();

        await expect(redSpan).toHaveCSS('background-color', 'rgb(215, 62, 62)');
    });

    test("should diplay green status indicator if switch is active (user is present)", async ({ page }) => {
        await turnSwitchOn(page);

        await page.waitForTimeout(1000);

        const button = await page.getByRole('button', { name: 'Ajutine' })
        const greenSpan = await button.locator('span').first();
        await expect(greenSpan).toHaveCSS('background-color', 'rgb(48, 134, 83)');
    });

    test("should display user profile/drawer", async ({ page }) => {
        const drawer = page.locator('.drawer');
        await expect(drawer).toBeVisible();
    });

    test("should display user details in the drawer", async ({ page }) => {
        const drawerBody = page.locator('.drawer__body');
        await expect(drawerBody).toBeVisible();


        // This takes the Kusutamiseks kasutaja as the testable user
        const userInfo = [
            { label: translation.displayName, value: 'Ajutine' },
            { label: translation.userRoles, value: 'Administrator' },
            { label: translation.userTitle, value: '' },
            { label: translation.email, value: 'email@mail.ee' }
        ];

        for (const { label, value } of userInfo) {
            await expect(drawerBody.locator(`text=${label}`)).toBeVisible();
        }
    });

    test("should display switch elements", async ({ page }) => {
        const drawerBody = page.locator('.drawer__body');
        await expect(drawerBody).toBeVisible();

        const switchSections = [
            // { title: 'Autokorrektor', labels: ['Teksti autokorrektor'] },
            // { title: 'Märguanded e-postile', labels: ['Uus suunatud vestlus', 'Uus vastamata vestlus'] },
            { title: translation.soundNotifications, labels: [translation.newForwardedChat, translation.newUnansweredChat] },
            { title: translation.popUpNotifications, labels: [translation.newForwardedChat, translation.newUnansweredChat] }
        ];


        for (const { title, labels } of switchSections) {
            const titleLocator = drawerBody.locator(`p.h6:has-text("${title}")`);
            await expect(titleLocator).toBeVisible();

            for (const label of labels) {
                // Use nth() to select the first occurrence if there are multiple elements
                const labelLocator = drawerBody.locator(`label.switch__label:has-text("${label}")`).first();
                await expect(labelLocator).toBeVisible();

                // Ensure the switch button for this label is visible
                const switchLocator = labelLocator.locator('..').locator('button');
                await expect(switchLocator).toBeVisible();
            }
        }
    });
});
