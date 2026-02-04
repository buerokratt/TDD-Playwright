const {expect, Locator} = require("@playwright/test");

class NewServicePage {
    constructor(page) {
        this.page = page;

        this.buttonSave = this.page.getByText('Salvesta', { exact: true }).last();
        this.buttonDelete = this.page.getByText('Kustuta', { exact: true });
        this.buttonConfirm = this.page.getByText('Kinnita', { exact: true });
        this.backToServices = this.page.getByRole('button', { name: 'Tagasi teenuste lehele' });
        this.stepName = this.page.getByText('...', { exact: true });

        this.serviceSettings = this.page.getByText('Teenuse seaded', {exact: true});
        this.closeSettings = this.page.locator('button.dialog__close');

        this.serviceTitle = this.page.getByLabel('Pealkiri');
        this.serviceDescription = this.page.getByPlaceholder('Kirjelda, mida teenus teeb...');
        this.labelMandatory = this.page.getByPlaceholder('Pealkiri on kohustuslik')

        this.canvas = this.page.locator('[role="application"]');
        this.buttonImport = this.page.getByText('Impordi', { exact: true });
        this.buttonExport = this.page.getByText('Ekspordi', { exact: true });
        this.nodeStart = this.page.locator('.react-flow__node-start .start-node');

        this.buttonAdd = this.page.getByRole('button', { name: '+', exact: true });
        this.nodeMenu = this.page.locator('[role="menu"]');
        this.dialog = this.page.locator('[role="dialog"]');

        this.dialogSave = this.dialog.getByText('Salvesta');
        this.dialogCancel = this.dialog.getByText('Tühista');
        this.dialogClose = this.dialog.locator('button.popup__close');

        this.buttonDefine = this.page.getByText('Määra', { expect: true });
        this.buttonMessageForCustomer = this.page.getByText('Sõnum kliendile', { expect: true });
        this.buttonCondition = this.page.getByText('Tingimus', { expect: true });
        this.buttonMultichoiceQuestion = this.page.getByText('Mitmevalikuline küsimus', { expect: true });
        this.buttonDynamicChoice = this.page.getByText('Dünaamilised valikud', { expect: true });
        this.buttonEndService = this.page.getByText('Teenuse lõpetamine', { expect: true });

        this.messageBox = this.page.locator('[contenteditable="true"]').first();
        this.confirmationText = this.page.getByText('Salvestatud', { exact: true });

        this.buttonZoomIn = this.page.getByTitle('Zoom In');
        this.buttonZoomOut = this.page.getByTitle('Zoom Out');
        this.buttonFitView = this.page.getByTitle('Fit View');

        this.sectionDefineElements = this.page.getByText('Määra elemendid', {exact: true});
        this.sectionEnvVariables = this.page.getByText('Keskkonnamuutujad', {exact: true});
        this.sectionDates = this.page.getByText('Kuupäev ja kellaaeg', {exact: true});
        this.sectionTools = this.page.getByText('Tööriistad', {exact: true});

        this.tabSettings = this.page.getByText('Seadistamine', {exact: true});
        this.tabTesting = this.page.getByText('Testimine', {exact: true});

        this.buttonYes = this.page.getByRole('button', {name: 'Jah', exact: true});
        this.buttonNo = this.page.getByRole('button', {name: 'Ei', exact: true});
        this.buttonSuccess = this.page.getByRole('button', {name: 'Success', exact: true});
        this.buttonFailure = this.page.getByRole('button', {name: 'Failure', exact: true});

        this.textArea = this.dialog.getByRole('textbox');

        this.buttonAddElement = this.page.getByRole('button', {name: '+ Element', exact: true});
        this.buttonRule = this.page.getByRole('button', {name: '+ Reegel', exact: true});
        this.buttonGroup = this.page.getByRole('button', {name: '+ Grupp', exact: true});

        this.dialogElementInput = this.dialog.getByRole('input').first();
        this.dialogElementDrag = this.dialog.getByPlaceholder('Lohista element siia', {exact: true});
        this.elementRows = this.dialog.locator('._assignElement_umtte_1');

        this.addButton = this.dialog.getByRole('button', {name: 'Lisa nupp +'});
        this.buttonAddApi = this.dialog.locator('button:has(svg path[d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"])');
        this.apiHeader = this.dialog.getByText('Loo uus otspunkt', {exact: true});

        this.apiURL = 'https://openholidaysapi.org/swagger/v1/swagger.json';

    }

    async createNewService(randomName){
        await this.serviceSettings.click();
        await this.page.waitForLoadState('domcontentloaded');
        await this.serviceTitle.fill(randomName);
        await this.closeSettings.click();
        await this.buttonSave.click();
        await this.page.waitForLoadState('networkidle');
        await expect(this.confirmationText).toBeVisible();
        await this.backToServices.click();
        await this.page.waitForLoadState('networkidle');
    }

    async addNodes(){
        await this.clickAddNode();
        await this.buttonMessageForCustomer.waitFor({state: 'visible'});
        await expect(this.buttonMessageForCustomer).toBeVisible();
        await this.buttonMessageForCustomer.click();

        await this.clickAddNode();
        await expect(this.buttonEndService).toBeVisible();
        await this.buttonEndService.click();

        await this.saveService();
        await this.page.waitForLoadState('networkidle');
        await this.confirmationText.waitFor({state: 'visible'});
    }

    async clickAddNode(){
        await this.buttonAdd.last().click();
        await this.page.waitForLoadState('domcontentloaded');
        await expect(this.dialog).toBeVisible();
    }

    async returnToServicesOverview(){
        await this.backToServices.click();
    }

    async addMessage(){
        await this.messageBox.click();
        await this.page.waitForLoadState('networkidle');
        await this.messageBox.fill('Test');
        await this.dialogSave.click();
    }

    getNodeByName(nodeName){
        return this.page.getByText(nodeName);
    }

    async editNode(nodeNome){
        const parentNode = this.getNodeByName(nodeNome, {exact: true}).locator('xpath=../..');
        await expect(parentNode.getByRole('button').first()).toBeVisible();
        await parentNode.getByRole('button').first().click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    async deleteNode(nodeName){
        const parentNode = nodeName.locator('xpath=../..');
        await expect(parentNode.getByRole('button').nth(1)).toBeVisible();
        await parentNode.getByRole('button').nth(1).click();
    }

    async saveService(){
        await expect(this.buttonSave).toBeVisible();
        await this.buttonSave.click();
        await expect(this.confirmationText).toBeVisible();
    }

    async assertHeaderElementVisible(){
        await expect(this.backToServices).toBeVisible();
        await expect(this.stepName).toBeVisible();
        await expect(this.buttonDelete).toBeVisible();
        await expect(this.buttonSave).toBeVisible();
        await expect(this.buttonConfirm).toBeVisible();
    }

    async assertServiceDetailsFieldsVisible(){
        await this.serviceSettings.click();
        await expect(this.serviceTitle).toBeVisible();
        await expect(this.labelMandatory).toBeVisible();
        await expect(this.serviceDescription).toBeVisible();
        await this.closeSettings.click();
    }

    async assertCanvasVisible(){
        await expect(this.canvas).toBeVisible();
    }

    async assertCanvasElementsVisible(){
        await expect(this.buttonImport).toBeVisible();
        await expect(this.buttonExport).toBeVisible();
        await expect(this.nodeStart).toBeVisible();
        await expect(this.buttonAdd).toBeVisible();
    }

    async assertZoomButtonsVisible(){
        await expect(this.buttonZoomOut).toBeVisible();
        await expect(this.buttonZoomIn).toBeVisible();
        await expect(this.buttonFitView).toBeVisible();
    }

    async getButtonCount(element){
        return await element.getByRole('button').count();
    }

    async assertSectionHasButtons(section) {
        await expect(await section.count()).toBeGreaterThan(0);
    }

    async assertNodeVisible(nodeName){
        await expect(nodeName).toBeVisible();
    }

    async selectNode(node){
        await node.click();
    }

    async assertDialogVisible(){
        await expect(this.dialog).toBeVisible();
    }

    async assertDefineElementsVisible(){
        await expect(this.sectionDefineElements).toBeVisible();
    }

    async assertDefineEnvVariablesVisible(){
        await expect(this.sectionEnvVariables).toBeVisible();
    }

    async assertDatesVisible(){
        await expect(this.sectionDates).toBeVisible();
    }

    async assertToolsVisible(){
        await expect(this.sectionTools).toBeVisible();
    }

    async assertTabsVisible(){
        await expect(this.tabSettings).toBeVisible();
        await expect(this.tabTesting).toBeVisible();
    }

    async assertDialogButtonsVisible(){
        await expect(this.dialogSave).toBeVisible();
        await expect(this.dialogCancel).toBeVisible();
        await expect(this.dialogClose).toBeVisible();
    }

    async assertConditionButtonsVisible(){
        await expect(this.buttonSuccess).toBeVisible();
        await expect(this.buttonFailure).toBeVisible();
    }

    async addElementToNode(){
        await this.buttonAddElement.click();
    }

    async assertElementRowAdded(){
        const rowcount = await this.elementRows.count();
        await this.addElementToNode();
        await expect(this.elementRows).toHaveCount(rowcount + 1);
    }

    // TODO: fix this somehow ...
    async assertElementButtons(){
        await expect(this.elementRows.getByRole('button')).toHaveCount(3);
    }

    async assertConditionButtons(){
        await expect(this.buttonRule).toBeVisible();
        await expect(this.buttonGroup).toBeVisible();
    }

    async assertDynamicChoiceFields() {
        await expect(this.elementRows).toHaveCount(4);
        const labels = ['Nimekiri', 'Teenuse nimi', 'Võti', 'Andmete võtmed'];

        const rows = this.dialog.locator('_assignElement_umtte_1');

        const count = await rows.count();

        for (let i = 0; i < count; i++) {
            const row = rows.nth(i);

            await expect(row.locator('[name="key"]'))
                .toContainText(new RegExp(labels.join('|')));

            await expect(row.locator('[name="value"]'))
                .toBeVisible();
        }
    }

    async addNewAPI(){
        await this.clickAddNode();
        await this.buttonAddApi.click();
        await this.page.waitForLoadState('domcontentloaded');
        await expect(this.apiHeader).toBeVisible();
    }

}
module.exports = { NewServicePage };