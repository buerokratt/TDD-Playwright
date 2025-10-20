class PageHeader {
    constructor(page) {
        this.page = page;

        this.logo = this.page.locator('svg').locator('g');
        this.toggleSwitch = this.page.getByRole('switch');
        this.statusInput = this.page.getByLabel('Staatuse täpsustus');
        this.buttonSave = this.page.locator('button').getByText('Salvesta');
        this.buttonCancel = this.page.locator('button').getByText('Tühista');
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

    async isLogoVisible(){
        await this.logo.isVisible();
    }

    async saveCSAStatus(){
        await this.statusInput.fill('CSA autotest');
        await this.buttonSave.click();
    }
}

module.exports = { PageHeader };