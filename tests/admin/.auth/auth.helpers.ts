import fs from 'fs';
import path from 'path';

export const AUTH_FILE = path.resolve(__dirname, 'user.json');

export async function ensureAuthDirectory(authFile: string = AUTH_FILE): Promise<void> {
  const authDirectory = path.dirname(authFile);

  if (!fs.existsSync(authDirectory)) {
    fs.mkdirSync(authDirectory, { recursive: true });
  }
}
