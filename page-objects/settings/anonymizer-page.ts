import { Locator, Page, expect, test } from '@playwright/test';

import {
  ACTION_TIMEOUT,
  ANONYMIZER_APPROACHES,
  ANONYMIZER_CONFIG_PATH,
  ANONYMIZER_ENTITIES,
  ANONYMIZER_TRANSFER_PATH,
} from '@utils/constants';
import { URLS } from '@utils/env';
import { AnonymizedText, AnonymizerSettings, RouteReadyOptions } from '@utils/interfaces';
import { waitForAnonymizerReady } from '@utils/waits';

const SELECT_PLACEHOLDER = '- Select option -';

export class AnonymizerPage {
  private readonly page: Page;

  private readonly headingSettings: Locator;
  private readonly headingTesting: Locator;
  private readonly headingEntities: Locator;
  private readonly headingAllowlist: Locator;
  private readonly headingDenylist: Locator;

  private readonly domainTabs: Locator;
  private readonly domainTabsActive: Locator;
  private readonly buttonCopyToDomain: Locator;

  private readonly selectApproach: Locator;
  private readonly textApproach: Locator;
  private readonly approachOptions: Locator;

  private readonly sectionEntities: Locator;
  private readonly sectionAllowlist: Locator;
  private readonly sectionDenylist: Locator;
  private readonly entityCheckboxes: Locator;

  private readonly rowAnonymizationBeforeLlm: Locator;
  private readonly rowRecordAnonymously: Locator;
  private readonly switchAnonymizationBeforeLlm: Locator;
  private readonly switchRecordAnonymously: Locator;

  private readonly buttonSaveSettings: Locator;
  private readonly toastList: Locator;

  private readonly textareaInputText: Locator;
  private readonly textareaOutputText: Locator;
  private readonly buttonClear: Locator;
  private readonly buttonAnonymize: Locator;

  private readonly dialogCopyToDomain: Locator;
  private readonly selectTargetDomains: Locator;
  private readonly targetDomainOptions: Locator;
  private readonly buttonCopy: Locator;

  constructor(page: Page) {
    this.page = page;

    const heading = (name: string): Locator => this.page.getByRole('heading', { name, exact: true });
    const section = (name: string): Locator => this.page.locator('main div.collapsible').filter({ has: heading(name) });
    const switchRow = (label: string): Locator =>
      this.page.locator('main div.track:has(> div.icon-switch)').filter({ hasText: label });

    this.headingSettings = heading('Anonymizer Settings');
    this.headingTesting = heading('Anonymizer Testing');
    this.headingEntities = heading('Entities to anonymize');
    this.headingAllowlist = heading('Add words to the allowlist');
    this.headingDenylist = heading('Add words to the denylist');

    this.domainTabs = this.page.locator('main .domain-tab-selector__tab');
    this.domainTabsActive = this.page.locator('main .domain-tab-selector__tab--active');
    this.buttonCopyToDomain = this.page.getByRole('button', { name: 'Copy to domain', exact: true });

    this.selectApproach = this.page.getByRole('combobox').first();
    this.textApproach = this.selectApproach.locator('p');
    this.approachOptions = this.page.getByRole('option');

    this.sectionEntities = section('Entities to anonymize');
    this.sectionAllowlist = section('Add words to the allowlist');
    this.sectionDenylist = section('Add words to the denylist');
    this.entityCheckboxes = this.sectionEntities.locator('input[type="checkbox"]');

    this.rowAnonymizationBeforeLlm = switchRow('Anonymization before LLM');
    this.rowRecordAnonymously = switchRow('Record conversations anonymously');
    this.switchAnonymizationBeforeLlm = this.rowAnonymizationBeforeLlm.getByRole('switch');
    this.switchRecordAnonymously = this.rowRecordAnonymously.getByRole('switch');

    this.buttonSaveSettings = this.page.getByRole('button', { name: 'Save Settings', exact: true });
    this.toastList = this.page.locator('ol.toast__list');

    this.textareaInputText = this.page.getByPlaceholder('Enter text to be anonymized');
    this.textareaOutputText = this.page.getByPlaceholder('Anonymized text will appear here');
    this.buttonClear = this.page.getByRole('button', { name: 'Clear', exact: true });
    this.buttonAnonymize = this.page.getByRole('button', { name: 'Anonymize', exact: true });

    this.dialogCopyToDomain = this.page.getByRole('dialog').filter({ has: heading('Copy to domain') });
    this.selectTargetDomains = this.dialogCopyToDomain.getByRole('combobox');
    this.targetDomainOptions = this.dialogCopyToDomain.getByRole('option');
    this.buttonCopy = this.dialogCopyToDomain.getByRole('button', { name: 'Copy', exact: true });
  }

  async waitForReady(options: RouteReadyOptions = {}): Promise<void> {
    await waitForAnonymizerReady(this.page, options);
  }

  async open(): Promise<void> {
    const settingsLoaded = this.page.waitForResponse(
      (response) => response.url().includes(ANONYMIZER_CONFIG_PATH) && response.ok(),
      { timeout: ACTION_TIMEOUT },
    );

    await this.page.goto(URLS.admin + 'chat/anonymizer');
    await this.waitForReady();
    await settingsLoaded;
    await this.waitForSettingsRendered();
  }

  async assertSettingsCardIsShown(): Promise<void> {
    await expect(this.headingSettings, 'The anonymizer never rendered its settings heading').toBeVisible();
    await expect(this.buttonCopyToDomain, 'The settings offer no way to copy them to another domain').toBeVisible();
  }

  async assertDomainTabsAreShown(): Promise<void> {
    await expect(this.domainTabs.first(), 'The settings are offered for no domain at all').toBeVisible();
    await expect(this.domainTabsActive, 'The domain tabs single out no domain as the one being edited').toHaveCount(1);
  }

  async assertApproachOptionsAreOffered(): Promise<void> {
    await expect(this.selectApproach, 'The settings hold no anonymization approach dropdown').toBeVisible();

    await this.selectApproach.click();
    await expect(
      this.approachOptions,
      'The anonymization approach dropdown offers a different set of options',
    ).toHaveText([...ANONYMIZER_APPROACHES]);

    await this.page.keyboard.press('Escape');
  }

  async assertEntitiesAreOffered(): Promise<void> {
    await expect(this.headingEntities, 'The settings hold no entities section').toBeVisible();
    await expect(this.entityCheckboxes, 'The entities section lists a different number of entities').toHaveCount(
      ANONYMIZER_ENTITIES.length,
    );

    for (const entity of ANONYMIZER_ENTITIES) {
      await expect(this.entityCheckbox(entity), `The entities section offers no "${entity}" checkbox`).toBeVisible();
    }
  }

  async assertWordListsAreOffered(): Promise<void> {
    await expect(this.headingAllowlist, 'The settings hold no allowlist section').toBeVisible();
    await expect(this.wordInput(this.sectionAllowlist), 'The allowlist section takes no word').toBeVisible();

    await expect(this.headingDenylist, 'The settings hold no denylist section').toBeVisible();
    await expect(this.wordInput(this.sectionDenylist), 'The denylist section takes no word').toBeVisible();
  }

  async assertTogglesAreShown(): Promise<void> {
    await expect(
      this.switchAnonymizationBeforeLlm,
      'The settings offer no toggle for anonymization before the LLM',
    ).toBeVisible();
    await expect(
      this.switchRecordAnonymously,
      'The settings offer no toggle for recording conversations anonymously',
    ).toBeVisible();

    await this.assertTooltipIsOffered(this.rowRecordAnonymously, '"Record conversations anonymously" toggle');
  }

  async assertSettingsAreSaveable(): Promise<void> {
    await expect(this.buttonSaveSettings, 'The page offers no way to save the anonymizer settings').toBeVisible();
  }

  async assertTestingCardIsShown(): Promise<void> {
    await expect(this.headingTesting, 'The page holds no anonymizer testing card').toBeVisible();
    await expect(this.textareaInputText, 'The testing card takes no text to anonymize').toBeVisible();
    await expect(this.buttonClear, 'The testing card offers no way to clear the text entered').toBeVisible();
    await expect(this.buttonAnonymize, 'The testing card offers no way to anonymize the text entered').toBeVisible();
    await expect(this.textareaOutputText, 'The testing card shows no anonymized text back').toBeVisible();
  }

  async anonymize(text: string): Promise<void> {
    await this.textareaInputText.fill(text);
    await this.buttonAnonymize.click();
  }

  async assertAnonymizationWasConfirmed({ timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<void> {
    await expect(this.toastList, 'Anonymizing the text raised no notification').toContainText(
      'Text anonymized successfully',
      { timeout },
    );
  }

  async assertOutputAnonymizes({ hidden, kept }: AnonymizedText): Promise<void> {
    await expect(async () => {
      const output = await this.textareaOutputText.inputValue();

      expect(output, 'The testing card showed no anonymized text back').not.toBe('');

      for (const value of hidden) {
        expect(output, `The anonymized text still carries "${value}"`).not.toContain(value);
      }

      for (const value of kept) {
        expect(output, `The anonymized text lost "${value}"`).toContain(value);
      }
    }).toPass({ timeout: ACTION_TIMEOUT });
  }

  async clearTestingInput(): Promise<void> {
    await this.buttonClear.click();
  }

  async assertTestingInputIsCleared(): Promise<void> {
    await expect(this.textareaInputText, 'The "Clear" button left the text entered in place').toHaveValue('', {
      timeout: ACTION_TIMEOUT,
    });
  }

  async selectFirstDomain(): Promise<string> {
    const tab = this.domainTabs.first();
    const domain = (await tab.innerText()).trim();

    await this.openDomainTab(tab, domain);

    return domain;
  }

  async domainNames(): Promise<string[]> {
    return (await this.domainTabs.allInnerTexts()).map((name) => name.trim());
  }

  async selectDomain(domain: string): Promise<void> {
    const tab = await this.domainTab(domain);

    await tab.click();
    await expect(tab, `The domain tabs never moved to "${domain}"`).toHaveClass(/domain-tab-selector__tab--active/);

    await this.open();
  }

  async copySettingsToDomain(domain: string): Promise<void> {
    await this.buttonCopyToDomain.click();
    await expect(
      this.dialogCopyToDomain,
      'The settings offered no dialog to copy them to another domain',
    ).toBeVisible();

    await this.selectTargetDomains.click();
    await this.targetDomainOptions
      .filter({ hasText: new RegExp(`^${domain}$`) })
      .first()
      .click();

    await this.selectTargetDomains.click();

    await expect(this.buttonCopy, `The dialog would not copy the settings to "${domain}"`).toBeEnabled({
      timeout: ACTION_TIMEOUT,
    });
    const settingsCopied = this.page.waitForResponse(
      (response) => response.url().includes(ANONYMIZER_TRANSFER_PATH) && response.ok(),
      { timeout: ACTION_TIMEOUT },
    );

    await this.buttonCopy.click();
    await settingsCopied;
    await expect(this.dialogCopyToDomain, 'The dialog stayed open after the settings were copied').toBeHidden();
  }

  async readSettings(): Promise<AnonymizerSettings> {
    return {
      approach: (await this.textApproach.innerText()).trim(),
      entities: await this.checkedEntities(),
      allowlist: await this.listedWords(this.sectionAllowlist),
      denylist: await this.listedWords(this.sectionDenylist),
      anonymizationBeforeLlm: await this.isSwitchOn(this.switchAnonymizationBeforeLlm),
      recordAnonymously: await this.isSwitchOn(this.switchRecordAnonymously),
    };
  }

  async applySettings(settings: AnonymizerSettings): Promise<void> {
    await this.chooseApproach(settings.approach);
    await this.setEntities(settings.entities);
    await this.setWords(this.sectionAllowlist, settings.allowlist);
    await this.setWords(this.sectionDenylist, settings.denylist);
    await this.setSwitch(this.switchAnonymizationBeforeLlm, settings.anonymizationBeforeLlm);
    await this.setSwitch(this.switchRecordAnonymously, settings.recordAnonymously);
  }

  async saveSettings(): Promise<void> {
    await this.buttonSaveSettings.click();
  }

  async assertSaveWasConfirmed({ timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<void> {
    await expect(this.toastList, 'Saving the anonymizer settings raised no notification').toContainText(
      'Anonymizer settings saved successfully',
      { timeout },
    );
  }

  async assertSettingsStored(expected: AnonymizerSettings): Promise<void> {
    await expect(async () => {
      expect(await this.readSettings(), 'The page came back holding settings other than the ones saved').toEqual(
        expected,
      );
    }).toPass({ timeout: ACTION_TIMEOUT });
  }

  async withSettingsRestored(body: (settingsBefore: AnonymizerSettings) => Promise<void>): Promise<void> {
    const settingsBefore = await this.readSettings();

    try {
      await body(settingsBefore);
    } finally {
      await this.restore(settingsBefore).catch((error: unknown) => {
        test.info().annotations.push({
          type: 'anonymizer settings left changed',
          description: error instanceof Error ? error.message.split('\n')[0] : String(error),
        });
      });
    }
  }

  async withSettingsRestoredForDomains(
    domains: string[],
    body: (settingsBefore: Record<string, AnonymizerSettings>) => Promise<void>,
  ): Promise<void> {
    const settingsBefore: Record<string, AnonymizerSettings> = {};

    for (const domain of domains) {
      await this.selectDomain(domain);
      settingsBefore[domain] = await this.readSettings();
    }

    try {
      await body(settingsBefore);
    } finally {
      for (const domain of domains) {
        await this.restoreDomain(domain, settingsBefore[domain]).catch((error: unknown) => {
          test.info().annotations.push({
            type: `anonymizer settings left changed on "${domain}"`,
            description: error instanceof Error ? error.message.split('\n')[0] : String(error),
          });
        });
      }
    }
  }

  private async openDomainTab(tab: Locator, domain: string): Promise<void> {
    const wasActive = ((await tab.getAttribute('class')) ?? '').includes('domain-tab-selector__tab--active');

    if (wasActive) {
      return;
    }

    const settingsLoaded = this.page.waitForResponse(
      (response) => response.url().includes(ANONYMIZER_CONFIG_PATH) && response.ok(),
      { timeout: ACTION_TIMEOUT },
    );

    await tab.click();
    await expect(tab, `The domain tabs never moved to "${domain}"`).toHaveClass(/domain-tab-selector__tab--active/);
    await settingsLoaded;
    await this.waitForSettingsRendered();
  }

  private async domainTab(domain: string): Promise<Locator> {
    const names = await this.domainNames();
    const index = names.indexOf(domain);

    expect(index, `The settings are offered for no domain named "${domain}"`).toBeGreaterThan(-1);

    return this.domainTabs.nth(index);
  }

  private async restoreDomain(domain: string, settings: AnonymizerSettings): Promise<void> {
    await this.selectDomain(domain);
    await this.applySettings(settings);
    await this.saveSettings();
    await this.assertSaveWasConfirmed();
  }

  private async restore(settings: AnonymizerSettings): Promise<void> {
    await this.open();
    await this.applySettings(settings);
    await this.saveSettings();
    await this.assertSaveWasConfirmed();
  }

  private async waitForSettingsRendered(): Promise<void> {
    await expect(this.textApproach, 'The anonymizer never filled its settings in').not.toHaveText(SELECT_PLACEHOLDER, {
      timeout: ACTION_TIMEOUT,
    });
  }

  private entityCheckbox(entity: string): Locator {
    return this.sectionEntities.locator(`input[type="checkbox"][name="${entity}"]`);
  }

  private wordInput(section: Locator): Locator {
    return section.locator('input.tag-input__input');
  }

  private wordTags(section: Locator): Locator {
    return section.locator('.tag-input__tag-text');
  }

  private async checkedEntities(): Promise<string[]> {
    const checked: string[] = [];

    for (const entity of ANONYMIZER_ENTITIES) {
      if (await this.entityCheckbox(entity).isChecked()) {
        checked.push(entity);
      }
    }

    return checked;
  }

  private async listedWords(section: Locator): Promise<string[]> {
    return (await this.wordTags(section).allInnerTexts()).map((word) => word.trim());
  }

  private async chooseApproach(approach: string): Promise<void> {
    if ((await this.textApproach.innerText()).trim() === approach) {
      return;
    }

    await this.selectApproach.click();
    await this.approachOptions.filter({ hasText: new RegExp(`^${approach}$`) }).click();
    await expect(this.textApproach, 'The approach dropdown kept the option it was clicked out of').toHaveText(approach);
  }

  private async setEntities(entities: string[]): Promise<void> {
    await expect(async () => {
      for (const entity of ANONYMIZER_ENTITIES) {
        const checkbox = this.entityCheckbox(entity);
        const wanted = entities.includes(entity);

        if ((await checkbox.isChecked()) !== wanted) {
          await checkbox.setChecked(wanted);
        }
      }

      expect(await this.checkedEntities(), 'The entities section kept a selection other than the one made').toEqual(
        entities,
      );
    }).toPass({ timeout: ACTION_TIMEOUT });
  }

  private async setWords(section: Locator, words: string[]): Promise<void> {
    const clearAll = section.locator('button.tag-input__clear-all');

    if (await clearAll.count()) {
      await clearAll.click();
    }

    const input = this.wordInput(section);

    for (const word of words) {
      await input.fill(word);
      await input.press('Enter');
    }

    await expect(this.wordTags(section), 'The word list kept words other than the ones entered').toHaveText(words);
  }

  private async isSwitchOn(toggle: Locator): Promise<boolean> {
    return (await toggle.getAttribute('aria-checked')) === 'true';
  }

  private async setSwitch(toggle: Locator, on: boolean): Promise<void> {
    await expect(async () => {
      if ((await this.isSwitchOn(toggle)) !== on) {
        await toggle.click();
      }

      expect(await this.isSwitchOn(toggle), 'The toggle kept the state it was clicked out of').toBe(on);
    }).toPass({ timeout: ACTION_TIMEOUT });
  }

  private async assertTooltipIsOffered(row: Locator, describedAs: string): Promise<void> {
    await row.locator('span[data-state="closed"]').first().hover();
    await expect(this.page.getByRole('tooltip'), `The ${describedAs} carries no tooltip`).toBeVisible();
  }
}
