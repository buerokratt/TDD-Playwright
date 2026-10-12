import { Dialog, Page, expect } from '@playwright/test';

export async function assertLeavingRaisesNoPrompt(page: Page, leave: () => Promise<void>): Promise<void> {
  const dialogs: string[] = [];
  const recordDialog = async (dialog: Dialog): Promise<void> => {
    dialogs.push(dialog.type());
    await dialog.accept();
  };

  page.on('dialog', recordDialog);

  try {
    await leave();
  } finally {
    page.off('dialog', recordDialog);
  }

  expect(dialogs, 'Leaving the page with an unsaved edit raised a prompt').toEqual([]);
}
