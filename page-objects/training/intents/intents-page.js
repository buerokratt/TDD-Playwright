class IntentsPage {
    constructor(page) {
        this.page = page;

        // this.newIntentNameInput = this.page.getByRole('input', { name: 'newIntentName' });
        this.newIntentNameInput = this.page.getByPlaceholder('Uue teema nimetus');
        this.buttonAdd = this.page.getByText('Lisa');
        this.switchServiceIntent = this.page.getByRole('switch', { name: 'Märgi teenuse kasutamiseks' })
        this.buttonUpload =  this.page.getByRole('button', { name: 'Laadi ülesse näited' });
        this.buttonAddToModel = this.page.getByText('Lisa mudelisse');
        this.buttonRemoveFromModel = this.page.getByText('Eemalda mudelisse');
    }

    async createNewIntent(intentName){
        await this.newIntentNameInput.fill(intentName);
        await this.buttonAdd.click();
        await this.switchServiceIntent.click();
        await this.buttonAddToModel.click();

        await this.page.waitForTimeout(3000);
        await this.buttonRemoveFromModel.isVisible();
    }
}
module.exports = { IntentsPage };