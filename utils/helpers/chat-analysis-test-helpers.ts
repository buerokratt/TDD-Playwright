import { Page, expect } from '@playwright/test';

import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { CHAT_ANALYSIS_LABEL_SECTIONS, CHAT_ANALYSIS_URL } from '@utils/constants';
import { ChatAnalysisConfig, ChatAnalysisDomainSnapshot } from '@utils/interfaces';

import { asUniqueNames } from './shared-helpers';

type Labels = string | string[];
type LabelsResolver = Labels | (() => Labels | Promise<Labels>);

export async function readChatAnalysisConfig(page: Page, domainId: string): Promise<ChatAnalysisConfig> {
  const response = await page.request.get(CHAT_ANALYSIS_URL, { params: { domain: domainId } });

  expect(
    response.ok(),
    `The back office would not report the chat analysis settings of "${domainId}" (${response.status()})`,
  ).toBeTruthy();

  const { response: config } = (await response.json()) as { response: ChatAnalysisConfig };

  return config;
}

export function chatAnalysisConfigRestore(resolveSnapshot: () => ChatAnalysisDomainSnapshot | undefined) {
  return async ({ page }: { page: Page }): Promise<void> => {
    const snapshot = resolveSnapshot();

    if (!snapshot) {
      return;
    }

    const response = await page.request.post(CHAT_ANALYSIS_URL, {
      data: { ...snapshot.config, domainUuid: [snapshot.domainId] },
    });

    expect(
      response.ok(),
      `The back office refused to restore the settings of domain "${snapshot.domainId}" (${response.status()})`,
    ).toBeTruthy();
  };
}

export function chatAnalysisCleanup(resolveLabels: LabelsResolver) {
  return async ({ page }: { page: Page }): Promise<void> => {
    const labels = asUniqueNames(typeof resolveLabels === 'function' ? await resolveLabels() : resolveLabels);

    if (!labels.length) {
      return;
    }

    const cap = new AdminPageFactory(page).getChatAnalysisPage();

    await cap.open();
    await cap.selectDomainTab();
    await cap.enableAnalysis();

    let removedAny = false;

    for (const section of CHAT_ANALYSIS_LABEL_SECTIONS) {
      for (const label of labels) {
        if (await cap.hasLabel(section.title, label)) {
          await cap.deleteLabel(section.title, label);
          removedAny = true;
        }
      }
    }

    if (removedAny) {
      await cap.saveSettings();
      await cap.assertSaveWasConfirmed();
    }
  };
}
