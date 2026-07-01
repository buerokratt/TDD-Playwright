import { Locator } from '@playwright/test';

export interface PaginatedDataTableOptions {
  readonly table: Locator;
  readonly pageSizeSelect?: Locator;
  readonly rowLabelSelector?: string;
  readonly defaultPageSize?: string;
}
