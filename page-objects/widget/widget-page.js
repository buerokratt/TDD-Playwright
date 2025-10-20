class WidgetPage {
    constructor(page) {
        this.page = page;

        this.widget = this.page.getByTitle('Ava vestlus');
        this.bykTitle = this.page.getByText('Bürokratt');
        this.inputField = this.page.getByPlaceholder('Kirjutage oma sõnum...');
        this.sendButton = this.page.getByTitle('Saada');
    }

    async openChat(){
        await this.widget.click();
        await this.bykTitle.isVisible();
    }

    async getCSAChat(){
        await this.inputField.fill('Tere');
        await this.sendButton.click();

        await this.page.waitForTimeout(3000);

        if (await this.page.getByText('Kuidas saan abiks olla?').isVisible()){
            await this.inputField.fill('Suuna mind');
        } else if(await this.page.getByText('Kas suunan teid klienditeenindajale? (Jah/Ei)').isVisible()){
            await this.inputField.fill('Jah');
        }
        await this.sendButton.click();

        await this.page.waitForTimeout(3000);
        await this.page.getByText('Suunan teid klienditeenindajale. Varuge natukene kannatust.').isVisible();
    }
}
module.exports = { WidgetPage };