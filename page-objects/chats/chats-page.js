const { waitForChatsReady } = require('../../utils/waits/admin-page-ready');

class ChatsPage {
    constructor(page) {
        this.page = page;

        this.list = this.page.getByRole('tablist');
        this.tabs = this.page.getByRole('tab');
        this.buttonAccept = this.page.locator('button', { hasText: 'Võta üle'});
        this.buttonEndChat = this.page.locator('button', { hasText: 'Lõpeta vestlus'});
        this.buttonForward = this.page.locator('button', { hasText: 'Suuna kolleegile'});
        this.buttonAskAuth = this.page.locator('button', { hasText: 'Küsi autentimist'});
        this.buttonAskContact = this.page.locator('button', { hasText: 'Küsi kontaktandmeid'});
        this.buttonAskApproval = this.page.locator('button', { hasText: 'Küsi nõusolekut'});
    }

    async waitForReady(options = {}) {
        await waitForChatsReady(this.page, options);
    }

    getLastListItem(){
        return this.tabs.last();
    }

    async acceptChat(){
        await this.waitForReady();
        await this.getLastListItem().click();
        await this.buttonAccept.click();
    }
}
module.exports = { UnansweredChatsPage: ChatsPage };