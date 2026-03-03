const { PageHeader } = require('./menu/page-header');
const { UnansweredChatsPage } = require('./chats/chats-page');
const { ServicesOverviewPage } = require("./services/overview/services-overview-page");
const { NewServicePage } = require("./services/newservice/new-service-page");
const { IntentsPage } = require("./training/intents/intents-page");
const {NewModelPage} = require("./training/newmodel/new-model-page");
const {SideMenuPage} = require("./menu/side-menu-page");

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

    getServicesOverview(){
        return new ServicesOverviewPage(this.page);
    }

    getNewServicePage(){
        return new NewServicePage(this.page);
    }

    getIntentsPage(){
        return new IntentsPage(this.page);
    }

    getNewModelPage(){
        return new NewModelPage(this.page);
    }
}

module.exports = { AdminPageFactory };