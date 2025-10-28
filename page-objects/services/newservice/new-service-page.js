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
    }

    async createNewService(randomName){
        await this.serviceTitle.fill(randomName);
        await this.buttonSave.click();
        await this.page.waitForLoadState('networkidle');
        await this.backToServices.click();
    }

    async addNodes(){
        await this.buttonAdd.last().click();
        await this.buttonMessageForCustomer.waitFor({state: 'visible'});
        await this.buttonMessageForCustomer.click();

        await this.buttonAdd.last().click();
        await this.buttonEndService.waitFor({state: 'visible'});
        await this.buttonEndService.click();

        await this.buttonSave.click();
        await this.page.waitForLoadState('networkidle');
    }

    async returnToServeicesOverview(){
        await this.backToServices.click();
    }

    async addMessage(){
        await this.messageBox.click();
        await this.page.waitForTimeout(2000);
        await this.messageBox.fill('Test');
    }

    getNodeByName(nodeName){
        return this.page.getByText(nodeName, { exact: true });
    }

    async editNode(nodeNome){
        const parentNode = this.getNodeByName(nodeNome).locator('xpath=../..');
        await parentNode.getByRole('button').first().click();
    }


}
module.exports = { NewServicePage };