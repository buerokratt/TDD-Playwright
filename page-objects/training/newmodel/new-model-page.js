const {expect} = require("@playwright/test");

class NewModelPage {
    constructor(page) {
        this.page = page;

        this.buttonTrain = this.page.getByText('Treeni', { exact: true });
        this.pageHeader = this.page.getByRole('h1', { name: 'Treeni ja testi' });
    }

    async clickTrainButton(){
        await this.buttonTrain.click();
    }

    async isPageHeaderVisible(){
        return expect(this.pageHeader).toBeVisible();
    }
}
module.exports = { NewModelPage };