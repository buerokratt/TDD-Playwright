const {expect} = require("@playwright/test");

class PageHeader {
    constructor(page) {
        this.page = page;

        this.logo = this.page.locator('svg').locator('g').first();
        this.toggleSwitch = this.page.getByRole('switch');
        this.statusInput = this.page.getByLabel('Staatuse täpsustus');
        this.buttonSave = this.page.locator('button').getByText('Salvesta');
        this.buttonCancel = this.page.locator('button').getByText('Tühista');
        this.buttonLogOut = this.page.getByRole('button', {name: 'Logi välja', exact: true});

        // TODO: CSA menu mapping
    };

    async markCSAPresent(){
        if (await this.toggleSwitch.getAttribute('data-state') === 'unchecked') {
            await this.toggleSwitch.click();
        }
    }

    async markCSAAway(){
        if (await this.toggleSwitch.getAttribute('data-state') === 'checked') {
            await this.toggleSwitch.click();
        }
    }

    async assertLogoVisible(){
        await expect(this.logo).toBeVisible();
    }

    async assertToggleSwitchVisible(){
        await expect(this.toggleSwitch).toBeVisible();;
    }

    async assertLogoutButtonVisible(){
        await expect(this.buttonLogOut).toBeVisible();;
    }

    async saveCSAStatus(){
        await this.statusInput.fill('CSA autotest');
        await this.buttonSave.click();
    }
}

module.exports = { PageHeader };