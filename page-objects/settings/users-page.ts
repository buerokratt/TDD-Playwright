import { Locator, Page, expect } from '@playwright/test';

import { PaginatedDataTable } from '@page-objects/common';
import {
  ACTION_TIMEOUT,
  ADD_USER_PROFILE_FIELDS,
  PAGE_PREFERENCE_PATH,
  USERS_TABLE_COLUMNS,
  USERS_TABLE_FILTERABLE_COLUMNS,
  USER_ROLES,
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

  private readonly dialogAddUser: Locator;
  private readonly headingAddUser: Locator;
  private readonly noteIdCodePrefix: Locator;
  private readonly optionsMultiSelect: Locator;
  private readonly buttonCancelAddUser: Locator;
  private readonly buttonConfirmAddUser: Locator;

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

    this.dialogAddUser = this.page.getByRole('dialog', { name: 'Add user' });
    this.headingAddUser = this.dialogAddUser.getByRole('heading', { name: 'Add user', exact: true });
    this.noteIdCodePrefix = this.dialogAddUser.getByText(
      'The personal identification number must start with a country prefix, (eg.EE12345678910)',
      { exact: true },
    );
    this.optionsMultiSelect = this.page.getByRole('option');
    this.buttonCancelAddUser = this.dialogAddUser.getByRole('button', { name: 'Cancel', exact: true });
    this.buttonConfirmAddUser = this.dialogAddUser.getByRole('button', { name: 'Add user', exact: true });
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

  private dialogTextbox(label: string): Locator {
    return this.dialogAddUser.getByRole('textbox', { name: label, exact: true });
  }

  private dialogMultiSelect(label: string): Locator {
    return this.dialogAddUser
      .locator('.multiSelect')
      .filter({ has: this.page.getByText(label, { exact: true }) })
      .first();
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

  async openAddUser(): Promise<void> {
    await this.buttonAddUser.click();
  }

  async assertAddUserDialogIsShown(): Promise<void> {
    await expect(this.dialogAddUser, 'Adding a user opened no dialog').toBeVisible();
    await expect(this.headingAddUser, 'The dialog is not titled "Add user"').toBeVisible();
  }

  async assertNameAndIdCodeAsked(): Promise<void> {
    await expect(this.dialogTextbox('First- and lastname'), 'The dialog asks for no first- and lastname').toBeVisible();
    await expect(this.dialogTextbox('ID code'), 'The dialog asks for no ID code').toBeVisible();
    await expect(
      this.noteIdCodePrefix,
      'The ID code was asked for without the note on its country prefix',
    ).toBeVisible();
  }

  async assertRolesOffered(): Promise<void> {
    await this.assertMultiSelectOffers('User role(s)', USER_ROLES);
  }

  async assertDomainsOffered(domainNames: readonly string[]): Promise<void> {
    await this.assertMultiSelectOffers('Domains', domainNames);
  }

  private async assertMultiSelectOffers(label: string, choices: readonly string[]): Promise<void> {
    const multiSelect = this.dialogMultiSelect(label);

    await expect(multiSelect, `The dialog offers no "${label}" multiselect`).toBeVisible();
    await expect(
      multiSelect.getByText('Choose', { exact: true }),
      `"${label}" does not start on its "Choose" placeholder`,
    ).toBeVisible();

    await multiSelect.getByRole('combobox').click();
    await expect(this.optionsMultiSelect, `"${label}" offers a different number of choices`).toHaveCount(
      choices.length,
    );

    for (const choice of choices) {
      await expect(
        this.page.getByRole('option', { name: choice, exact: true }),
        `"${label}" does not offer "${choice}"`,
      ).toHaveCount(1);
    }

    await this.headingAddUser.click();
    await expect(this.optionsMultiSelect, `The choices of "${label}" stayed open over the dialog`).toHaveCount(0);
  }

  async assertProfileFieldsAsked(): Promise<void> {
    for (const label of ADD_USER_PROFILE_FIELDS) {
      await expect(this.dialogTextbox(label), `The dialog asks for no "${label}"`).toBeVisible();
    }
  }

  async assertCancelAndConfirmOffered(): Promise<void> {
    await expect(this.buttonCancelAddUser, 'The dialog offers no way to cancel').toBeVisible();
    await expect(this.buttonConfirmAddUser, 'The dialog offers no way to add the user').toBeVisible();
  }
}
