export function createChatMarker(prefix: string): string {
  const token = Date.now()
    .toString(36)
    .replace(/\d/g, (digit) => 'qrstuvwxyz'[Number(digit)]);

  return `${prefix} ${token}`;
}

export function chatMarkerPhrase(marker: string): string {
  const token = marker.lastIndexOf(' ');

  if (token < 1) {
    throw new Error(`A chat marker needs wording around its token, got "${marker}"`);
  }

  return marker.slice(0, token);
}
