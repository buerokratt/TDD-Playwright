import { Locator } from '@playwright/test';

export interface PaginatedDataTableOptions {
  readonly table: Locator;
  readonly rowLabelSelector?: string;
  readonly defaultPageSize?: string;
  readonly pageSizeSelect?: Locator;
}
