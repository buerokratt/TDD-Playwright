export function uniqueSuffix(): string {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, '')
    .slice(0, 14);
  const random = Math.random()
    .toString(36)
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 6);

  return `${stamp}${random}`;
}
