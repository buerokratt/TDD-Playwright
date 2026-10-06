import type { ActiveChatsPage, HistoryPage, UnansweredChatsPage } from '@page-objects/chats';
import type { Header, SideMenu } from '@page-objects/menu';
import type { NewServicePage, ServicesOverviewPage } from '@page-objects/services';
import type {
  AnonymizerPage,
  ChatAnalysisPage,
  DeleteConversationsPage,
  MultiDomainsPage,
  OfficeOpeningHoursPage,
  SessionLengthPage,
} from '@page-objects/settings';

export interface AdminPagesFixtures {
  header: Header;
  sideMenu: SideMenu;
  unansweredChatsPage: UnansweredChatsPage;
  activeChatsPage: ActiveChatsPage;
  historyPage: HistoryPage;
  servicesOverviewPage: ServicesOverviewPage;
  newServicePage: NewServicePage;
  chatAnalysisPage: ChatAnalysisPage;
  officeOpeningHoursPage: OfficeOpeningHoursPage;
  sessionLengthPage: SessionLengthPage;
  deleteConversationsPage: DeleteConversationsPage;
  anonymizerPage: AnonymizerPage;
  multiDomainsPage: MultiDomainsPage;
}
