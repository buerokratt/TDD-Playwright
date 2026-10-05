import { Locator, Page, Response, expect, test } from '@playwright/test';

import { CopyToDomainModal } from '@page-objects/common';
import {
  ACTION_TIMEOUT,
  ANONYMIZER_APPROACHES,
  AnonymizerApproach,
  AnonymizerEntity,
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

  private readonly headingAnonymizerSettings: Locator;
  private readonly headingAnonymizerTesting: Locator;
  private readonly sectionHeadingEntities: Locator;
  private readonly sectionHeadingAllowlist: Locator;
  private readonly sectionHeadingDenylist: Locator;
  private readonly noteEntities: Locator;
  private readonly noteAllowlist: Locator;
  private readonly noteDenylist: Locator;
  private readonly noteTesting: Locator;

  private readonly domainTabs: Locator;
  private readonly domainTabActive: Locator;
  private readonly buttonCopyToDomain: Locator;
  private readonly copyToDomain: CopyToDomainModal;

  private readonly triggerApproachSelector: Locator;
  private readonly optionsApproachSelector: Locator;

  private readonly sectionEntities: Locator;
  private readonly sectionAllowlist: Locator;
  private readonly sectionDenylist: Locator;
  private readonly optionsEntities: Locator;

  private readonly switchAnonymizationBeforeLlm: Locator;
  private readonly switchRecordAnonymously: Locator;

  private readonly buttonSaveSettings: Locator;
  private readonly toastList: Locator;

  private readonly textareaInputText: Locator;
  private readonly textareaOutputText: Locator;
  private readonly buttonClear: Locator;
  private readonly buttonAnonymize: Locator;

  constructor(page: Page) {
    this.page = page;

    const heading = (name: string): Locator => this.page.getByRole('heading', { name, exact: true });
    const section = (name: string): Locator => this.page.locator('main div.collapsible').filter({ has: heading(name) });
    this.headingAnonymizerSettings = heading('Anonymizer Settings');
    this.headingAnonymizerTesting = heading('Anonymizer Testing');
    this.sectionHeadingEntities = heading('Entities to anonymize');
    this.sectionHeadingAllowlist = heading('Add words to the allowlist');
    this.sectionHeadingDenylist = heading('Add words to the denylist');
    this.noteEntities = this.page.getByText(
      'Select the types of entities you want to anonymize in the conversations with the user.',
      { exact: true },
    );
    this.noteAllowlist = this.page.getByText('Allowlist contains words that should not be anonymized', { exact: true });
    this.noteDenylist = this.page.getByText('Denylist contains words that should be anonymized', { exact: true });
    this.noteTesting = this.page.getByText(
      'To test your anonymizer configuration, enter the input text and press "Anonymize"',
      { exact: true },
    );

    this.domainTabs = this.page.locator('main .domain-tab-selector__tab');
    this.domainTabActive = this.page.locator('main .domain-tab-selector__tab--active');
    this.buttonCopyToDomain = this.page.getByRole('button', { name: 'Copy to domain', exact: true });
    this.copyToDomain = new CopyToDomainModal(this.page, {
      button: this.buttonCopyToDomain,
      transferPath: ANONYMIZER_TRANSFER_PATH,
    });

    this.triggerApproachSelector = this.page.getByRole('combobox').first();
    this.optionsApproachSelector = this.page.getByRole('option');

    this.sectionEntities = section('Entities to anonymize');
    this.sectionAllowlist = section('Add words to the allowlist');
    this.sectionDenylist = section('Add words to the denylist');
    this.optionsEntities = this.sectionEntities.locator('input[type="checkbox"]');

    this.switchAnonymizationBeforeLlm = this.switchRow('Anonymization before LLM').getByRole('switch');
    this.switchRecordAnonymously = this.switchRow('Record conversations anonymously').getByRole('switch');

    this.buttonSaveSettings = this.page.getByRole('button', { name: 'Save Settings', exact: true });
    this.toastList = this.page.locator('ol.toast__list');

    this.textareaInputText = this.page.getByPlaceholder('Enter text to be anonymized');
    this.textareaOutputText = this.page.getByPlaceholder('Anonymized text will appear here');
    this.buttonClear = this.page.getByRole('button', { name: 'Clear', exact: true });
    this.buttonAnonymize = this.page.getByRole('button', { name: 'Anonymize', exact: true });
  }

  async waitForReady(options: RouteReadyOptions = {}): Promise<void> {
    await waitForAnonymizerReady(this.page, options);
  }

  async open(): Promise<void> {
    const settingsLoaded = this.settingsLoaded();

    await this.page.goto(URLS.admin + 'chat/anonymizer');
    await this.waitForReady();
    await settingsLoaded;
    await this.waitForSettingsRendered();
  }

  async assertSettingsCardIsShown(): Promise<void> {
    await expect(this.headingAnonymizerSettings, 'The anonymizer never rendered its settings heading').toBeVisible();
    await this.copyToDomain.assertIsOffered();
    await expect(this.buttonSaveSettings, 'The page offers no way to save the anonymizer settings').toBeVisible();
  }

  async assertDomainTabsAreShown(): Promise<void> {
    await expect(this.domainTabs.first(), 'The page rendered no domain tab').toBeVisible();
    await expect(this.domainTabActive, 'The domain tabs left no domain selected').toHaveCount(1);
  }

  async assertApproachOptionsAreOffered(): Promise<void> {
    await expect(this.triggerApproachSelector, 'The settings hold no anonymization approach dropdown').toBeVisible();

    await this.triggerApproachSelector.click();
    await expect(
      this.optionsApproachSelector,
      'The anonymization approach dropdown offers a different set of options',
    ).toHaveText([...ANONYMIZER_APPROACHES]);

    await this.page.keyboard.press('Escape');
  }

  async assertEntitiesAreOffered(): Promise<void> {
    await expect(this.sectionHeadingEntities, 'The settings hold no entities section').toBeVisible();
    await expect(this.noteEntities, 'The entities section explains nothing about what it selects').toBeVisible();
    await expect(this.optionsEntities, 'The entities section lists a different number of entities').toHaveCount(
      ANONYMIZER_ENTITIES.length,
    );

    for (const entity of ANONYMIZER_ENTITIES) {
      await expect(this.entityOption(entity), `The entities section offers no "${entity}" checkbox`).toBeVisible();
    }
  }

  async assertWordListsAreOffered(): Promise<void> {
    await expect(this.sectionHeadingAllowlist, 'The settings hold no allowlist section').toBeVisible();
    await expect(this.noteAllowlist, 'The allowlist section explains nothing about the words it holds').toBeVisible();
    await expect(this.wordInput(this.sectionAllowlist), 'The allowlist section takes no word').toBeVisible();

    await expect(this.sectionHeadingDenylist, 'The settings hold no denylist section').toBeVisible();
    await expect(this.noteDenylist, 'The denylist section explains nothing about the words it holds').toBeVisible();
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

    await this.assertTooltipIsOffered('Record conversations anonymously', '"Record conversations anonymously" toggle');
  }

  async assertTestingCardIsShown(): Promise<void> {
    await expect(this.headingAnonymizerTesting, 'The page holds no anonymizer testing card').toBeVisible();
    await expect(this.noteTesting, 'The testing card explains nothing about how to use it').toBeVisible();
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

  async assertOutputWasAnonymized({ hidden, kept }: AnonymizedText): Promise<void> {
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
    await this.openDomainTab(await this.domainTab(domain), domain);
  }

  async copySettingsTo(domain: string): Promise<void> {
    await this.copyToDomain.copyTo(domain);
  }

  async readSettings(): Promise<AnonymizerSettings> {
    return {
      approach: await this.selectedApproach(),
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
    } catch (error) {
      await this.restoreSettings(settingsBefore).catch((restoreError: unknown) => {
        this.annotateRestoreFailure('anonymizer settings left changed', restoreError);
      });
      throw error;
    }

    await this.restoreSettings(settingsBefore);
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
    } catch (error) {
      await this.restoreSettingsForDomains(settingsBefore);
      throw error;
    }

    expect(
      await this.restoreSettingsForDomains(settingsBefore),
      'The anonymizer settings could not be put back on every domain',
    ).toEqual([]);
  }

  private async openDomainTab(tab: Locator, domain: string): Promise<void> {
    const wasActive = ((await tab.getAttribute('class')) ?? '').includes('domain-tab-selector__tab--active');

    if (wasActive) {
      return;
    }

    const settingsLoaded = this.settingsLoaded();

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

  private async restoreSettingsForDomain(domain: string, settings: AnonymizerSettings): Promise<void> {
    await this.selectDomain(domain);
    await this.applySettings(settings);
    await this.saveSettings();
    await this.assertSaveWasConfirmed();
  }

  private async restoreSettingsForDomains(settings: Record<string, AnonymizerSettings>): Promise<string[]> {
    const leftChanged: string[] = [];

    for (const [domain, settingsBefore] of Object.entries(settings)) {
      await this.restoreSettingsForDomain(domain, settingsBefore).catch((error: unknown) => {
        this.annotateRestoreFailure(`anonymizer settings left changed on "${domain}"`, error);
        leftChanged.push(domain);
      });
    }

    return leftChanged;
  }

  private annotateRestoreFailure(type: string, error: unknown): void {
    test.info().annotations.push({
      type,
      description: error instanceof Error ? error.message.split('\n')[0] : String(error),
    });
  }

  private async restoreSettings(settings: AnonymizerSettings): Promise<void> {
    await this.open();
    await this.applySettings(settings);
    await this.saveSettings();
    await this.assertSaveWasConfirmed();
  }

  private async waitForSettingsRendered(): Promise<void> {
    await expect(this.approachText(), 'The anonymizer never filled its settings in').not.toHaveText(
      SELECT_PLACEHOLDER,
      {
        timeout: ACTION_TIMEOUT,
      },
    );
  }

  private settingsLoaded({ timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<Response> {
    return this.page.waitForResponse(
      (response) => response.url().includes(ANONYMIZER_CONFIG_PATH) && response.request().method() === 'GET',
      { timeout },
    );
  }

  private approachText(): Locator {
    return this.triggerApproachSelector.locator('p');
  }

  private async selectedApproach(): Promise<AnonymizerApproach> {
    const shown = (await this.approachText().innerText()).trim();
    const approach = ANONYMIZER_APPROACHES.find((candidate) => candidate === shown);

    if (!approach) {
      throw new Error(`The anonymizer displayed an unknown approach: "${shown}"`);
    }

    return approach;
  }

  private entityOption(entity: string): Locator {
    return this.sectionEntities.locator(`input[type="checkbox"][name="${entity}"]`);
  }

  private wordInput(section: Locator): Locator {
    return section.locator('input.tag-input__input');
  }

  private wordTags(section: Locator): Locator {
    return section.locator('.tag-input__tag-text');
  }

  private async checkedEntities(): Promise<AnonymizerEntity[]> {
    const checked: AnonymizerEntity[] = [];

    for (const entity of ANONYMIZER_ENTITIES) {
      if (await this.entityOption(entity).isChecked()) {
        checked.push(entity);
      }
    }

    return checked;
  }

  private async listedWords(section: Locator): Promise<string[]> {
    return (await this.wordTags(section).allInnerTexts()).map((word) => word.trim());
  }

  private async chooseApproach(approach: AnonymizerApproach): Promise<void> {
    if ((await this.approachText().innerText()).trim() === approach) {
      return;
    }

    await this.triggerApproachSelector.click();
    await this.optionsApproachSelector.filter({ hasText: new RegExp(`^${approach}$`) }).click();
    await expect(this.approachText(), 'The approach dropdown kept the option it was clicked out of').toHaveText(
      approach,
    );
  }

  private async setEntities(entities: readonly AnonymizerEntity[]): Promise<void> {
    await expect(async () => {
      for (const entity of ANONYMIZER_ENTITIES) {
        const checkbox = this.entityOption(entity);
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

  private switchRow(label: string): Locator {
    return this.page.locator('main div.track:has(> div.icon-switch)').filter({ hasText: label });
  }

  private async assertTooltipIsOffered(label: string, describedAs: string): Promise<void> {
    await this.switchRow(label).locator('span[data-state="closed"]').first().hover();
    await expect(this.page.getByRole('tooltip'), `The ${describedAs} carries no tooltip`).toBeVisible();
  }
}
