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
  readonly header: Header;
  readonly sideMenu: SideMenu;
  readonly unansweredChatsPage: UnansweredChatsPage;
  readonly activeChatsPage: ActiveChatsPage;
  readonly historyPage: HistoryPage;
  readonly servicesOverviewPage: ServicesOverviewPage;
  readonly newServicePage: NewServicePage;
  readonly chatAnalysisPage: ChatAnalysisPage;
  readonly officeOpeningHoursPage: OfficeOpeningHoursPage;
  readonly sessionLengthPage: SessionLengthPage;
  readonly deleteConversationsPage: DeleteConversationsPage;
  readonly anonymizerPage: AnonymizerPage;
  readonly multiDomainsPage: MultiDomainsPage;
}
