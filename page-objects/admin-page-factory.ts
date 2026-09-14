import { Page } from '@playwright/test';

import { ActiveChatsPage, HistoryPage, UnansweredChatsPage } from '@page-objects/chats';
import { Header, SideMenu } from '@page-objects/menu';
import { NewServicePage, ServicesOverviewPage } from '@page-objects/services';
import {
  ChatAnalysisPage,
  DeleteConversationsPage,
  MultiDomainsPage,
  OfficeOpeningHoursPage,
  SessionLengthPage,
} from '@page-objects/settings';

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

  getHistoryPage(): HistoryPage {
    return new HistoryPage(this.page);
  }

  getServicesOverviewPage(): ServicesOverviewPage {
    return new ServicesOverviewPage(this.page);
  }

  getNewServicePage(): NewServicePage {
    return new NewServicePage(this.page);
  }

  getChatAnalysisPage(): ChatAnalysisPage {
    return new ChatAnalysisPage(this.page);
  }

  getOfficeOpeningHoursPage(): OfficeOpeningHoursPage {
    return new OfficeOpeningHoursPage(this.page);
  }

  getSessionLengthPage(): SessionLengthPage {
    return new SessionLengthPage(this.page);
  }

  getDeleteConversationsPage(): DeleteConversationsPage {
    return new DeleteConversationsPage(this.page);
  }

  getMultiDomainsPage(): MultiDomainsPage {
    return new MultiDomainsPage(this.page);
  }
}
