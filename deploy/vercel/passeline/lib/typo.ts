/**
 * US typography for strings that come from `lib/`: curly apostrophes and
 * curly double quotes.
 */
export function typo(text: string) {
  return text.replace(/'/g, "’").replace(/"([^"]*)"/g, "“$1”")
}
