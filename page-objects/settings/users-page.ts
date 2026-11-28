import { Locator, Page, expect } from '@playwright/test';

import { PaginatedDataTable } from '@page-objects/common';
import {
  ACTION_TIMEOUT,
  REQUIRED_USER_FIELD_MESSAGE,
  USERS_TABLE_COLUMNS,
  USERS_TABLE_FILTERABLE_COLUMNS,
  USER_ROLES,
  UserRole,
  USERS_TABLE_RESULT_COUNTS,
} from '@utils/constants';
import { URLS } from '@utils/env';
import { RouteReadyOptions, UserData, UserDialogFillOptions, UserRow } from '@utils/interfaces';
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
  private readonly buttonConfirmAddUser: Locator;

  private readonly dialogEditUser: Locator;
  private readonly headingEditUser: Locator;
  private readonly buttonConfirmEditUser: Locator;

  private readonly dialogDeleteUser: Locator;
  private readonly buttonConfirmDeleteUser: Locator;

  private readonly dialogUser: Locator;
  private readonly optionsMultiSelect: Locator;
  private readonly buttonCancelUser: Locator;

  private readonly toastItems: Locator;

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
    this.buttonConfirmAddUser = this.dialogAddUser.getByRole('button', { name: 'Add user', exact: true });

    this.dialogEditUser = this.page.getByRole('dialog', { name: 'Edit user' });
    this.headingEditUser = this.dialogEditUser.getByRole('heading', { name: 'Edit user', exact: true });
    this.buttonConfirmEditUser = this.dialogEditUser.getByRole('button', { name: 'Edit user', exact: true });

    this.dialogDeleteUser = this.page.getByRole('dialog', { name: 'Delete user' });
    this.buttonConfirmDeleteUser = this.dialogDeleteUser.getByRole('button', { name: 'Yes', exact: true });

    this.dialogUser = this.dialogAddUser.or(this.dialogEditUser);
    this.optionsMultiSelect = this.page.getByRole('option');
    this.buttonCancelUser = this.dialogUser.getByRole('button', { name: 'Cancel', exact: true });

    this.toastItems = this.page.locator('ol.toast__list li');
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

  private columnSortButton(column: string): Locator {
    return this.columnHeader(column).getByRole('button').nth(0);
  }

  private columnFilterButton(column: string): Locator {
    return this.columnHeader(column).getByRole('button').nth(1);
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
    await expect(this.buttonAddUser, 'The page does not offer a way to add a user').toBeVisible();
  }

  async assertTableListsEveryColumnWithSorting(): Promise<void> {
    await expect(this.table, 'The users table is not on the page').toBeVisible();

    for (const column of USERS_TABLE_COLUMNS) {
      await expect(this.columnHeader(column), `The table does not list the "${column}" column`).toBeVisible();
      await expect(
        this.columnSortButton(column),
        `The "${column}" column does not offer a way to sort by it`,
      ).toBeVisible();
    }
  }

  async assertFilterOfferedOnlyOnFilterableColumns(): Promise<void> {
    for (const column of USERS_TABLE_COLUMNS) {
      const filterable = USERS_TABLE_FILTERABLE_COLUMNS.includes(column);

      await expect(
        this.columnFilterButton(column),
        filterable
          ? `The "${column}" column does not offer a way to filter by it`
          : `The "${column}" column offers a filter`,
      ).toHaveCount(filterable ? 1 : 0);
    }
  }

  async assertEveryRowOffersStatusEditAndDelete(): Promise<void> {
    const rows = await this.usersTable.getRows().count();

    expect(rows, 'The users table stayed empty').toBeGreaterThan(0);
    await expect(this.columnCells('Status').locator('button'), 'A user row does not offer its status').toHaveCount(
      rows,
    );
    await expect(
      this.table.getByRole('button', { name: 'Edit', exact: true }),
      'A user row does not offer Edit',
    ).toHaveCount(rows);
    await expect(
      this.table.getByRole('button', { name: 'Delete', exact: true }),
      'A user row does not offer Delete',
    ).toHaveCount(rows);
  }

  async assertDeleteDisabledOnlyOnOwnRow(personalCode: string): Promise<void> {
    const ownRow = await this.usersTable.findRowAcrossPages(`EE${personalCode}`);

    await expect(ownRow, 'The logged-in user is not in the list').toBeVisible();
    await expect(
      ownRow.getByRole('button', { name: 'Delete', exact: true }),
      'The logged-in user is offered a way to delete themselves',
    ).toBeDisabled();
    expect(
      await this.usersTable.countAcrossPages((rows) =>
        rows.getByRole('button', { name: 'Delete', exact: true, disabled: true }),
      ),
      'Delete is disabled on a user other than the logged-in one',
    ).toBe(1);
  }

  async readPageSize(): Promise<string> {
    return this.selectPageSize.inputValue();
  }

  async assertPagingOfferedWhenListOverflows(): Promise<void> {
    const pageSize = Number(await this.readPageSize());
    const rows = await this.usersTable.getRows().count();

    if (rows < pageSize) {
      await expect(this.paginationNavigation, 'The list fits on one page but was offered paging').toBeHidden();
      return;
    }

    await expect(
      this.paginationNavigation,
      'The list filled its page but does not offer a way to turn it',
    ).toBeVisible();
  }

  async assertResultCountOffered(): Promise<void> {
    await expect(this.selectPageSize, 'The table does not offer a choice of how many rows to show').toBeVisible();
    await expect(
      this.selectPageSize.locator('option'),
      'The result count offers a different set of page sizes',
    ).toHaveText(USERS_TABLE_RESULT_COUNTS);
  }

  async openAddUserDialog(): Promise<void> {
    await this.buttonAddUser.click();
  }

  async assertAddUserDialogIsShown(): Promise<void> {
    await expect(this.dialogAddUser, 'Adding a user did not open a dialog').toBeVisible();
    await expect(this.headingAddUser, 'The dialog is not titled "Add user"').toBeVisible();
  }

  async assertNameAndIdCodeAsked(): Promise<void> {
    for (const label of ['First- and lastname', 'ID code']) {
      await expect(
        this.dialogTextbox(this.dialogAddUser, label),
        `The dialog does not ask for "${label}"`,
      ).toBeVisible();
    }
    await expect(
      this.noteIdCodePrefix,
      'The ID code was asked for without the note on its country prefix',
    ).toBeVisible();
  }

  async assertRolesOffered(user?: UserRow): Promise<void> {
    await this.assertMultiSelectOffers(
      user ? this.dialogEditUser : this.dialogAddUser,
      'User role(s)',
      USER_ROLES,
      user?.roles ?? [],
    );
  }

  async assertDomainsOffered(domainNames: readonly string[], user?: UserRow): Promise<void> {
    await this.assertMultiSelectOffers(
      user ? this.dialogEditUser : this.dialogAddUser,
      'Domains',
      domainNames,
      user?.domains ?? [],
    );
  }

  private async assertMultiSelectOffers(
    dialog: Locator,
    label: string,
    available: readonly string[],
    chosen: readonly string[] = [],
  ): Promise<void> {
    const multiSelect = this.dialogMultiSelect(dialog, label);
    const choices = available.filter((choice) => !chosen.includes(choice));

    await expect(multiSelect, `The dialog does not offer the "${label}" multiselect`).toBeVisible();

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
    for (const label of ['Display Name', 'User title', 'E-mail', 'Department']) {
      await expect(
        this.dialogTextbox(this.dialogAddUser, label),
        `The dialog does not ask for "${label}"`,
      ).toBeVisible();
    }
  }

  async assertAddUserControlsOffered(): Promise<void> {
    await expect(this.buttonCancelUser, 'The dialog does not offer a way to cancel').toBeVisible();
    await expect(this.buttonConfirmAddUser, 'The dialog does not offer a way to add the user').toBeVisible();
  }

  async fillAddUserDialog(user: UserData): Promise<void> {
    await this.fillUserDialog(this.dialogAddUser, user, { idCode: true, roles: true });
  }

  private async fillUserDialog(
    dialog: Locator,
    user: UserData,
    { idCode = false, roles = false }: UserDialogFillOptions = {},
  ): Promise<void> {
    await this.dialogTextbox(dialog, 'First- and lastname').fill(user.name);

    if (idCode) {
      await this.dialogTextbox(dialog, 'ID code').fill(`EE${user.personalCode}`);
    }

    if (roles) {
      await this.chooseOptions(dialog, 'User role(s)', user.roles);
    }

    await this.dialogTextbox(dialog, 'Display Name').fill(user.displayName);
    await this.dialogTextbox(dialog, 'E-mail').fill(user.email);
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
    await this.markShownToasts();
    await this.buttonConfirmAddUser.click();
  }

  async assertAddUserDialogClosed(): Promise<void> {
    await expect(this.dialogAddUser, 'The "Add user" dialog stayed open after adding the user').toBeHidden();
  }

  async assertUserAddedConfirmed({ timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<void> {
    await expect(this.newToast('New user added'), 'Adding the user did not raise a new notification').toBeVisible({
      timeout,
    });
  }

  async fillUserField(label: string, value: string): Promise<void> {
    await this.dialogTextbox(this.dialogUser, label).fill(value);
  }

  async assertRequiredFieldsFlagged(labels: readonly string[]): Promise<void> {
    for (const label of labels) {
      await this.assertFieldRejected(label, REQUIRED_USER_FIELD_MESSAGE);
    }
  }

  async assertFieldRejected(label: string, message: string): Promise<void> {
    await expect(this.fieldMessage(this.dialogUser, label), `"${label}" was not rejected as "${message}"`).toHaveText(
      message,
    );
  }

  async assertUserExistsReported({ timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<void> {
    await expect(
      this.newToast('User Exists'),
      'Adding a user under a taken ID code did not raise a new "User Exists" notification',
    ).toBeVisible({ timeout });
  }

  async assertUserNotListed(name: string): Promise<void> {
    await this.usersTable.expectRowDeleted(name);
  }

  async assertUserListed(user: UserData): Promise<void> {
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
    ).toHaveCSS('background-color', 'rgb(215, 62, 62)');
  }

  async deleteUserIfExists(personalCode: string): Promise<void> {
    const row = await this.usersTable.findRowAcrossPages(`EE${personalCode}`);

    if (!(await row.count())) {
      return;
    }

    await this.openDeleteUserDialog(personalCode);
    await this.confirmDeleteUser();
    await this.usersTable.expectRowDeleted(`EE${personalCode}`);
  }

  async openDeleteUserDialog(personalCode: string): Promise<void> {
    const row = await this.usersTable.findRowAcrossPages(`EE${personalCode}`);

    await row.getByRole('button', { name: 'Delete', exact: true }).click();
  }

  async confirmDeleteUser(): Promise<void> {
    await this.markShownToasts();
    await this.buttonConfirmDeleteUser.click();
  }

  async assertUserDeletedConfirmed({ timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<void> {
    await expect(this.newToast('User deleted'), 'Deleting the user did not raise a new notification').toBeVisible({
      timeout,
    });
  }

  async readUserRow(personalCode: string): Promise<UserRow> {
    const row = await this.usersTable.findRowAcrossPages(`EE${personalCode}`);

    await expect(row, `The user ${personalCode} is not in the list`).toBeVisible();

    const cells = (await row.locator('td').allInnerTexts()).map((text) => text.trim());
    const cell = (column: string): string => cells[USERS_TABLE_COLUMNS.indexOf(column)];
    const list = (column: string): string[] => cell(column).split(', ').filter(Boolean);
    const roles = list('Role');

    expect(USER_ROLES, `The user ${personalCode} holds a role the suite does not know`).toEqual(
      expect.arrayContaining(roles),
    );

    return {
      name: cell('Name'),
      roles: roles as UserRole[],
      domains: list('Domains'),
      displayName: cell('Display Name'),
      title: cell('User title'),
      email: cell('E-mail'),
      department: cell('Department'),
    };
  }

  async openEditUserDialog(personalCode: string): Promise<void> {
    const row = await this.usersTable.findRowAcrossPages(`EE${personalCode}`);

    await row.getByRole('button', { name: 'Edit', exact: true }).click();
  }

  async assertEditUserDialogIsShown(): Promise<void> {
    await expect(this.dialogEditUser, 'Editing a user did not open a dialog').toBeVisible();
    await expect(this.headingEditUser, 'The dialog is not titled "Edit user"').toBeVisible();
  }

  async assertNameFilledIn(user: UserRow): Promise<void> {
    await expect(
      this.dialogTextbox(this.dialogEditUser, 'First- and lastname'),
      '"First- and lastname" does not hold the value the row lists',
    ).toHaveValue(user.name);
  }

  async assertProfileFieldsFilledIn(user: UserRow): Promise<void> {
    for (const [label, value] of [
      ['Display Name', user.displayName],
      ['User title', user.title],
      ['E-mail', user.email],
      ['Department', user.department],
    ]) {
      await expect(
        this.dialogTextbox(this.dialogEditUser, label),
        `"${label}" does not hold the value the row lists`,
      ).toHaveValue(value);
    }
  }

  async assertEditUserControlsOffered(): Promise<void> {
    await expect(this.buttonCancelUser, 'The dialog does not offer a way to cancel').toBeVisible();
    await expect(this.buttonConfirmEditUser, 'The dialog does not offer a way to save the user').toBeVisible();
  }

  async fillEditUserDialog(
    user: UserData,
    { roles = false }: Pick<UserDialogFillOptions, 'roles'> = {},
  ): Promise<void> {
    await this.fillUserDialog(this.dialogEditUser, user, { roles });
  }

  async clearEditUserDialog(user: UserData): Promise<void> {
    for (const label of ['First- and lastname', 'Display Name', 'E-mail']) {
      await this.dialogTextbox(this.dialogEditUser, label).fill('');
    }

    for (const role of user.roles) {
      await this.dialogMultiSelect(this.dialogEditUser, 'User role(s)')
        .getByRole('button', { name: `Remove ${role}`, exact: true })
        .click();
    }
  }

  async confirmEditUser(): Promise<void> {
    await this.markShownToasts();
    await this.buttonConfirmEditUser.click();
  }

  async assertEditUserDialogClosed(): Promise<void> {
    await expect(this.dialogEditUser, 'The "Edit user" dialog stayed open after saving the user').toBeHidden();
  }

  async assertUserUpdatedConfirmed({ timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<void> {
    await expect(this.newToast('User updated'), 'Saving the user did not raise a new notification').toBeVisible({
      timeout,
    });
  }

  private async markShownToasts(): Promise<void> {
    await this.toastItems.evaluateAll((toasts) => toasts.forEach((toast) => toast.setAttribute('data-seen', '')));
  }

  private newToast(text: string): Locator {
    return this.toastItems.and(this.page.locator(':not([data-seen])')).filter({ hasText: text }).first();
  }
}
