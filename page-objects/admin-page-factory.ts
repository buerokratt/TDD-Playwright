import { Page } from '@playwright/test';

import { ActiveChatsPage, UnansweredChatsPage } from '@page-objects/chats';
import { Header, SideMenu } from '@page-objects/menu';
import { NewServicePage, ServicesOverviewPage } from '@page-objects/services';
import { DeleteConversationsPage, MultiDomainsPage, OfficeOpeningHoursPage } from '@page-objects/settings';

export class AdminPageFactory {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  getPageHeader(): Header {
    return new Header(this.page);
  }

  getSideMenu(): SideMenu {
    return new SideMenu(this.page);
  }

  getUnansweredChatsPage(): UnansweredChatsPage {
    return new UnansweredChatsPage(this.page);
  }

  getActiveChatsPage(): ActiveChatsPage {
    return new ActiveChatsPage(this.page);
  }

  getServicesOverviewPage(): ServicesOverviewPage {
    return new ServicesOverviewPage(this.page);
  }

  getNewServicePage(): NewServicePage {
    return new NewServicePage(this.page);
  }

  getOfficeOpeningHoursPage(): OfficeOpeningHoursPage {
    return new OfficeOpeningHoursPage(this.page);
  }

  getDeleteConversationsPage(): DeleteConversationsPage {
    return new DeleteConversationsPage(this.page);
  }

  getMultiDomainsPage(): MultiDomainsPage {
    return new MultiDomainsPage(this.page);
  }
}
