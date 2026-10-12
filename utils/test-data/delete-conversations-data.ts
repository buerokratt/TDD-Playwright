const FALLBACK_PERIOD = '365';
const FALLBACK_DELETION_TIME = '11:00:00';

export function createLongerPeriod(currentPeriod?: string): string {
  const current = Number.parseInt(currentPeriod ?? '', 10);

  if (Number.isFinite(current)) return String(current + 1);
  return FALLBACK_PERIOD;
}

export function createShiftedDeletionTime(currentTime?: string): string {
  const [hours, minutes = '00', seconds = '00'] = (currentTime ?? '').split(':');
  const current = Number.parseInt(hours, 10);

  if (Number.isFinite(current)) return `${String((current + 1) % 24).padStart(2, '0')}:${minutes}:${seconds}`;
  return FALLBACK_DELETION_TIME;
}
