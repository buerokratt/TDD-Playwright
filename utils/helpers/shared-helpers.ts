export function asUniqueNames(value: string | string[]): string[] {
  return [...new Set((Array.isArray(value) ? value : [value]).flat().filter(Boolean).map(String))];
}
