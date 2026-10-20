import { Locator, Page, expect } from '@playwright/test';

import { PaginatedDataTable } from '@page-objects/common';
import {
  ACTION_TIMEOUT,
  PAGE_PREFERENCE_PATH,
  USERS_TABLE_COLUMNS,
  USERS_TABLE_FILTERABLE_COLUMNS,
  USERS_TABLE_RESULT_COUNTS,
} from '@utils/constants';
import { URLS } from '@utils/env';
import { RouteReadyOptions } from '@utils/interfaces';
import { waitForUsersReady } from '@utils/waits';

export class UsersPage {
  private readonly page: Page;

  private readonly headingUsers: Locator;
  private readonly buttonAddUser: Locator;

  private readonly table: Locator;

  private readonly paginationNavigation: Locator;
  private readonly selectPageSize: Locator;

  private readonly usersTable: PaginatedDataTable;

  constructor(page: Page) {
    this.page = page;

    this.headingUsers = this.page.getByRole('heading', { name: 'Users', exact: true });
    this.buttonAddUser = this.page.getByRole('button', { name: 'Add user', exact: true });

    this.table = this.page.locator('main').getByRole('table').first();

    this.paginationNavigation = this.page.getByRole('navigation', { name: 'Pagination navigation' });
    this.selectPageSize = this.page.locator('main .data-table__page-size select');

    this.usersTable = new PaginatedDataTable(this.page, {
      table: this.table,
      pageSizeSelect: this.selectPageSize,
      rowLabelSelector: 'td',
      defaultPageSize: USERS_TABLE_RESULT_COUNTS[0],
    });
  }

  async waitForReady(options: RouteReadyOptions = {}): Promise<void> {
    await waitForUsersReady(this.page, options);
  }

  async open(): Promise<void> {
    await this.page.goto(URLS.admin + 'chat/users');
    await this.waitForReady();
  }

  private columnHeader(column: string): Locator {
    return this.table.getByRole('columnheader', { name: column, exact: true });
  }

  private columnCells(column: string): Locator {
    return this.usersTable.getRows().locator(`td:nth-child(${USERS_TABLE_COLUMNS.indexOf(column) + 1})`);
  }

  async assertHeadingAndAddUserShown(): Promise<void> {
    await expect(this.headingUsers, 'Users never rendered its heading').toBeVisible();
    await expect(this.buttonAddUser, 'The page offers no way to add a user').toBeVisible();
  }

  async assertTableListsEveryColumnWithSorting(): Promise<void> {
    await expect(this.table, 'The users table is not on the page').toBeVisible();

    for (const column of USERS_TABLE_COLUMNS) {
      await expect(this.columnHeader(column), `The table lists no "${column}" column`).toBeVisible();
      await expect(
        this.columnHeader(column).locator('button').first(),
        `The "${column}" column was listed with no way to sort by it`,
      ).toBeVisible();
    }
  }

  async assertFilterOfferedOnlyOnFilterableColumns(): Promise<void> {
    for (const column of USERS_TABLE_COLUMNS) {
      const filterable = USERS_TABLE_FILTERABLE_COLUMNS.includes(column);

      await expect(
        this.columnHeader(column).locator('button'),
        filterable
          ? `The "${column}" column offers no way to filter by it`
          : `The "${column}" column offers a filter the case does not name`,
      ).toHaveCount(filterable ? 2 : 1);
    }
  }

  async assertEveryRowOffersStatusEditAndDelete(): Promise<void> {
    const rows = await this.usersTable.getRows().count();

    expect(rows, 'The users table stayed empty').toBeGreaterThan(0);
    await expect(this.columnCells('Status').locator('button'), 'A user was listed with no status to click').toHaveCount(
      rows,
    );
    await expect(
      this.table.getByRole('button', { name: 'Edit', exact: true }),
      'A user was listed with no way to edit them',
    ).toHaveCount(rows);
    await expect(
      this.table.getByRole('button', { name: 'Delete', exact: true }),
      'A user was listed with no way to delete them',
    ).toHaveCount(rows);
  }

  async assertDeleteDisabledOnlyOnOwnRow(personalCode: string): Promise<void> {
    const ownRow = await this.usersTable.findRowAcrossPages(`EE${personalCode}`);

    await expect(ownRow, 'The logged-in user is not in the list').toBeVisible();
    await expect(
      ownRow.getByRole('button', { name: 'Delete', exact: true }),
      'The logged-in user is offered a way to delete themselves',
    ).toBeDisabled();
    await expect(
      this.table.getByRole('button', { name: 'Delete', exact: true, disabled: true }),
      'Delete is disabled on a user other than the logged-in one',
    ).toHaveCount(1);
  }

  async readPageSize(): Promise<string> {
    return this.selectPageSize.inputValue();
  }

  async setPageSize(pageSize: string, { timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<void> {
    if ((await this.readPageSize()) === pageSize) {
      return;
    }

    const [response] = await Promise.all([
      this.page.waitForResponse(
        (response) => response.url().includes(PAGE_PREFERENCE_PATH) && response.request().method() === 'POST',
        { timeout },
      ),
      this.selectPageSize.selectOption(pageSize),
    ]);

    expect(response.ok(), `The back office would not save the result count (${response.status()})`).toBeTruthy();
    await expect(this.selectPageSize, `The result count would not move to "${pageSize}"`).toHaveValue(pageSize);
    await this.usersTable.waitUntilReady();
  }

  async assertPagingOfferedWhenListOverflows(): Promise<void> {
    const pageSize = Number(await this.readPageSize());
    const rows = await this.usersTable.getRows().count();

    expect(rows, 'The users table stayed empty').toBeGreaterThan(0);

    if (rows < pageSize) {
      return;
    }

    await expect(this.paginationNavigation, 'The list filled its page but was offered no way to turn it').toBeVisible();
  }

  async assertResultCountOffered(): Promise<void> {
    await expect(this.selectPageSize, 'The table offers no choice of how many rows to show').toBeVisible();
    await expect(
      this.selectPageSize.locator('option'),
      'The result count offers a different set of page sizes',
    ).toHaveText(USERS_TABLE_RESULT_COUNTS);
  }
}
