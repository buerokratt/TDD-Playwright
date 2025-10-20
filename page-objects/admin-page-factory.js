const { PageHeader } = require('./menu/page-header');
const { UnansweredChatsPage } = require('./chats/chats-page');

class AdminPageFactory {
    constructor(page) {
        this.page = page;
    }

    getPageHeader() {
        return new PageHeader(this.page);
    }

    getSideMenu(){
        return new SideMenuPage(this.page);
    }

    getChats(){
        return new UnansweredChatsPage(this.page);
    }
}

module.exports = { AdminPageFactory };