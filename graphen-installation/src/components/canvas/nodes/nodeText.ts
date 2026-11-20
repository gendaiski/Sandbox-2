export function nodeText(value: unknown): string | undefined {
  if (typeof value === 'string') return value || undefined
  if (typeof value === 'number') return String(value)
  return undefined
}
