const {expect} = require("@playwright/test");

class NewServicePage {
    constructor(page) {
        this.page = page;

        this.serviceTitle = this.page.getByPlaceholder('Pealkiri');
        this.buttonSave = this.page.getByText('Salvesta', { exact: true });
        this.buttonConfirm = this.page.getByText('Kinnita', { exact: true });
        this.buttonEndService = this.page.getByText('Teenuse lõpetamine', { exact: true });
        this.buttonAdd = this.page.getByRole('button', { name: '+', exact: true });
        this.buttonMessageForCustomer = this.page.getByText('Sõnum kliendile', { exact: true });
        this.messageBox = this.page.locator('[contenteditable="true"]').first();
        this.backToServices = this.page.getByRole('button', { name: '< Tagasi teenuste lehele' });
        this.confirmationText = this.page.getByText('Salvestatud', { exact: true });
    }

    async createNewService(randomName){
        await this.serviceTitle.fill(randomName);
        await this.buttonSave.click();
        await this.page.waitForLoadState('networkidle');
        await expect(this.confirmationText).toBeVisible();
        await this.backToServices.click();
    }

    async addNodes(){
        await this.buttonAdd.last().click();
        await this.buttonMessageForCustomer.waitFor({state: 'visible'});
        await expect(this.buttonMessageForCustomer).toBeVisible();
        await this.buttonMessageForCustomer.click();

        await this.buttonAdd.last().click();
        await expect(this.buttonEndService).toBeVisible();
        await this.buttonEndService.click();

        await this.buttonSave.click();
        await this.page.waitForLoadState('networkidle');
        await this.confirmationText.waitFor({state: 'visible'});
    }

    async returnToServicesOverview(){
        await this.backToServices.click();
    }

    async addMessage(){
        await this.messageBox.click();
        await this.page.waitForLoadState('networkidle');
        await this.messageBox.fill('Test');
        await this.buttonSave.last().click();
    }

    getNodeByName(nodeName){
        return this.page.getByText(nodeName, { exact: true });
    }

    async editNode(nodeNome){
        const parentNode = this.getNodeByName(nodeNome).locator('xpath=../..');
        await expect(parentNode.getByRole('button').first()).toBeVisible();
        await parentNode.getByRole('button').first().click();
    }

    async saveService(){
        await expect(this.buttonSave).toBeVisible();
        await this.buttonSave.click();
        await expect(this.confirmationText).toBeVisible();
    }


}
module.exports = { NewServicePage };