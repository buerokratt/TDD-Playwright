import { Locator, Page, expect } from '@playwright/test';

import { PaginatedDataTable } from '@page-objects/common';
import {
  ACTION_TIMEOUT,
  ADD_USER_PROFILE_FIELDS,
  ADD_USER_REQUIRED_FIELDS,
  PAGE_PREFERENCE_PATH,
  USERS_TABLE_COLUMNS,
  USERS_TABLE_FILTERABLE_COLUMNS,
  USER_ROLES,
  USER_STATUS_BUSY_COLOR,
  USERS_TABLE_RESULT_COUNTS,
} from '@utils/constants';
import { URLS } from '@utils/env';
import { NewUserData, RouteReadyOptions, UserRow } from '@utils/interfaces';
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

  private readonly dialogEditUser: Locator;
  private readonly headingEditUser: Locator;
  private readonly buttonCancelEditUser: Locator;
  private readonly buttonConfirmEditUser: Locator;

  private readonly dialogUser: Locator;

  private readonly toastList: Locator;

  private readonly dialogDeleteUser: Locator;
  private readonly buttonConfirmDeleteUser: Locator;

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

    this.dialogEditUser = this.page.getByRole('dialog', { name: 'Edit user' });
    this.headingEditUser = this.dialogEditUser.getByRole('heading', { name: 'Edit user', exact: true });
    this.buttonCancelEditUser = this.dialogEditUser.getByRole('button', { name: 'Cancel', exact: true });
    this.buttonConfirmEditUser = this.dialogEditUser.getByRole('button', { name: 'Edit user', exact: true });

    this.dialogUser = this.dialogAddUser.or(this.dialogEditUser);

    this.toastList = this.page.locator('ol.toast__list');

    this.dialogDeleteUser = this.page.getByRole('dialog', { name: 'Delete user' });
    this.buttonConfirmDeleteUser = this.dialogDeleteUser.getByRole('button', { name: 'Yes', exact: true });
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

  private dialogTextbox(dialog: Locator, label: string): Locator {
    return dialog.getByRole('textbox', { name: label, exact: true });
  }

  private dialogMultiSelect(dialog: Locator, label: string): Locator {
    return dialog
      .locator('.multiSelect')
      .filter({ has: this.page.getByText(label, { exact: true }) })
      .first();
  }

  private fieldMessage(dialog: Locator, label: string): Locator {
    return dialog
      .locator('.track > *')
      .filter({ has: this.page.getByText(label, { exact: true }) })
      .first()
      .locator('xpath=following-sibling::*[1][self::span]');
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
    await expect(
      this.dialogTextbox(this.dialogAddUser, 'First- and lastname'),
      'The dialog asks for no first- and lastname',
    ).toBeVisible();
    await expect(this.dialogTextbox(this.dialogAddUser, 'ID code'), 'The dialog asks for no ID code').toBeVisible();
    await expect(
      this.noteIdCodePrefix,
      'The ID code was asked for without the note on its country prefix',
    ).toBeVisible();
  }

  async assertRolesOffered(): Promise<void> {
    await this.assertMultiSelectOffers(this.dialogAddUser, 'User role(s)', USER_ROLES);
  }

  async assertDomainsOffered(domainNames: readonly string[]): Promise<void> {
    await this.assertMultiSelectOffers(this.dialogAddUser, 'Domains', domainNames);
  }

  private async assertMultiSelectOffers(
    dialog: Locator,
    label: string,
    available: readonly string[],
    chosen: readonly string[] = [],
  ): Promise<void> {
    const multiSelect = this.dialogMultiSelect(dialog, label);
    const choices = available.filter((choice) => !chosen.includes(choice));

    await expect(multiSelect, `The dialog offers no "${label}" multiselect`).toBeVisible();

    if (chosen.length === 0) {
      await expect(
        multiSelect.getByText('Choose', { exact: true }),
        `"${label}" does not start on its "Choose" placeholder`,
      ).toBeVisible();
    }

    for (const choice of chosen) {
      await expect(
        multiSelect.getByRole('button', { name: `Remove ${choice}`, exact: true }),
        `"${label}" does not hold "${choice}"`,
      ).toBeVisible();
    }

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

    await dialog.getByRole('heading').first().click();
    await expect(this.optionsMultiSelect, `The choices of "${label}" stayed open over the dialog`).toHaveCount(0);
  }

  async assertProfileFieldsAsked(): Promise<void> {
    for (const label of ADD_USER_PROFILE_FIELDS) {
      await expect(this.dialogTextbox(this.dialogAddUser, label), `The dialog asks for no "${label}"`).toBeVisible();
    }
  }

  async assertAddUserControlsOffered(): Promise<void> {
    await expect(this.buttonCancelAddUser, 'The dialog offers no way to cancel').toBeVisible();
    await expect(this.buttonConfirmAddUser, 'The dialog offers no way to add the user').toBeVisible();
  }

  async fillAddUser(user: NewUserData): Promise<void> {
    await this.dialogTextbox(this.dialogAddUser, 'First- and lastname').fill(user.name);
    await this.dialogTextbox(this.dialogAddUser, 'ID code').fill(`EE${user.personalCode}`);
    await this.chooseOptions(this.dialogAddUser, 'User role(s)', user.roles);
    await this.dialogTextbox(this.dialogAddUser, 'Display Name').fill(user.displayName);
    await this.dialogTextbox(this.dialogAddUser, 'E-mail').fill(user.email);
  }

  private async chooseOptions(dialog: Locator, label: string, choices: readonly string[]): Promise<void> {
    const multiSelect = this.dialogMultiSelect(dialog, label);

    for (const choice of choices) {
      const option = this.page.getByRole('option', { name: choice, exact: true });

      if (!(await option.isVisible())) {
        await multiSelect.getByRole('combobox').click();
      }

      await option.click();
      await expect(
        multiSelect.getByRole('button', { name: `Remove ${choice}`, exact: true }),
        `"${label}" did not take "${choice}"`,
      ).toBeVisible();
    }

    await dialog.getByRole('heading').first().click();
    await expect(this.optionsMultiSelect, `The choices of "${label}" stayed open over the dialog`).toHaveCount(0);
  }

  async confirmAddUser(): Promise<void> {
    await this.buttonConfirmAddUser.click();
  }

  async assertAddUserDialogClosed(): Promise<void> {
    await expect(this.dialogAddUser, 'The "Add user" dialog stayed open after adding the user').toBeHidden();
  }

  async assertUserAddedConfirmed({ timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<void> {
    await expect(this.toastList, 'Adding the user raised no notification').toContainText('New user added', {
      timeout,
    });
  }

  async fillIdCode(idCode: string): Promise<void> {
    await this.dialogTextbox(this.dialogAddUser, 'ID code').fill(idCode);
  }

  async fillEmail(email: string): Promise<void> {
    await this.dialogTextbox(this.dialogUser, 'E-mail').fill(email);
  }

  async assertRequiredFieldsFlagged(labels: readonly string[] = ADD_USER_REQUIRED_FIELDS): Promise<void> {
    for (const label of labels) {
      await this.assertFieldRejected(label, 'Required');
    }
  }

  async assertFieldRejected(label: string, message: string): Promise<void> {
    await expect(this.fieldMessage(this.dialogUser, label), `"${label}" was not rejected as "${message}"`).toHaveText(
      message,
    );
  }

  async assertUserExistsReported({ timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<void> {
    await expect(
      this.toastList,
      'Adding a user under a taken ID code raised no "User Exists" notification',
    ).toContainText('User Exists', { timeout });
  }

  async assertUserNotListed(name: string): Promise<void> {
    await this.usersTable.expectRowDeleted(name);
  }

  async assertUserListed(user: NewUserData): Promise<void> {
    const row = await this.readUserRow(user.personalCode);

    expect(row, 'The users table does not list the new user with the entered values').toMatchObject({
      name: user.name,
      roles: user.roles,
      displayName: user.displayName,
      email: user.email,
    });
  }

  async assertUserBusy(personalCode: string): Promise<void> {
    const row = await this.usersTable.findRowAcrossPages(`EE${personalCode}`);

    await expect(
      row
        .locator(`td:nth-child(${USERS_TABLE_COLUMNS.indexOf('Status') + 1})`)
        .getByRole('button')
        .locator('span'),
      `The user ${personalCode} is not shown as "Busy"`,
    ).toHaveCSS('background-color', USER_STATUS_BUSY_COLOR);
  }

  async deleteUserIfExists(personalCode: string): Promise<void> {
    const row = await this.usersTable.findRowAcrossPages(`EE${personalCode}`);

    if (!(await row.count())) {
      return;
    }

    await row.getByRole('button', { name: 'Delete', exact: true }).click();
    await this.buttonConfirmDeleteUser.click();
    await this.usersTable.expectRowDeleted(`EE${personalCode}`);
  }

  async readUserRow(personalCode: string): Promise<UserRow> {
    const row = await this.usersTable.findRowAcrossPages(`EE${personalCode}`);

    await expect(row, `The user ${personalCode} is not in the list`).toBeVisible();

    const cells = (await row.locator('td').allInnerTexts()).map((text) => text.trim());
    const cell = (column: string): string => cells[USERS_TABLE_COLUMNS.indexOf(column)];
    const list = (column: string): string[] => cell(column).split(', ').filter(Boolean);

    return {
      name: cell('Name'),
      roles: list('Role'),
      domains: list('Domains'),
      displayName: cell('Display Name'),
      title: cell('User title'),
      email: cell('E-mail'),
      department: cell('Department'),
    };
  }

  async openEditUser(personalCode: string): Promise<void> {
    const row = await this.usersTable.findRowAcrossPages(`EE${personalCode}`);

    await row.getByRole('button', { name: 'Edit', exact: true }).click();
  }

  async assertEditUserDialogIsShown(): Promise<void> {
    await expect(this.dialogEditUser, 'Editing a user opened no dialog').toBeVisible();
    await expect(this.headingEditUser, 'The dialog is not titled "Edit user"').toBeVisible();
  }

  async assertNameFilledIn(user: UserRow): Promise<void> {
    await expect(
      this.dialogTextbox(this.dialogEditUser, 'First- and lastname'),
      'The dialog does not start on the name the row lists',
    ).toHaveValue(user.name);
  }

  async assertUserRolesHeld(user: UserRow): Promise<void> {
    await this.assertMultiSelectOffers(this.dialogEditUser, 'User role(s)', USER_ROLES, user.roles);
  }

  async assertUserDomainsHeld(user: UserRow, domainNames: readonly string[]): Promise<void> {
    await this.assertMultiSelectOffers(this.dialogEditUser, 'Domains', domainNames, user.domains);
  }

  async assertProfileFilledIn(user: UserRow): Promise<void> {
    for (const [label, value] of [
      ['Display Name', user.displayName],
      ['User title', user.title],
      ['E-mail', user.email],
      ['Department', user.department],
    ]) {
      await expect(
        this.dialogTextbox(this.dialogEditUser, label),
        `The dialog does not start "${label}" on what the row lists`,
      ).toHaveValue(value);
    }
  }

  async assertEditUserControlsOffered(): Promise<void> {
    await expect(this.buttonCancelEditUser, 'The dialog offers no way to cancel').toBeVisible();
    await expect(this.buttonConfirmEditUser, 'The dialog offers no way to save the user').toBeVisible();
  }

  async fillEditUser(user: NewUserData): Promise<void> {
    await this.dialogTextbox(this.dialogEditUser, 'First- and lastname').fill(user.name);
    await this.dialogTextbox(this.dialogEditUser, 'Display Name').fill(user.displayName);
    await this.dialogTextbox(this.dialogEditUser, 'E-mail').fill(user.email);
  }

  async clearEditUser(user: NewUserData): Promise<void> {
    for (const label of ['First- and lastname', 'Display Name', 'E-mail']) {
      await this.dialogTextbox(this.dialogEditUser, label).fill('');
    }

    for (const role of user.roles) {
      await this.dialogMultiSelect(this.dialogEditUser, 'User role(s)')
        .getByRole('button', { name: `Remove ${role}`, exact: true })
        .click();
    }
  }

  async selectEditUserRoles(roles: readonly string[]): Promise<void> {
    await this.chooseOptions(this.dialogEditUser, 'User role(s)', roles);
  }

  async confirmEditUser(): Promise<void> {
    await this.buttonConfirmEditUser.click();
  }

  async assertEditUserDialogClosed(): Promise<void> {
    await expect(this.dialogEditUser, 'The "Edit user" dialog stayed open after saving the user').toBeHidden();
  }

  async assertUserUpdatedConfirmed({ timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<void> {
    await expect(this.toastList, 'Saving the user raised no notification').toContainText('User updated', {
      timeout,
    });
  }
}
