/**
 * American typography: keeps a number and its unit together (10 mi, 3 days)
 * and turns straight apostrophes and quotes into curly ones.
 */
export function typo(text: string) {
  return text
    .replace(/(\d) (mi|min|minutes|days|hours|business)\b/g, "$1 $2")
    .replace(/(\w)'(\w)/g, "$1’$2")
    .replace(/"([^"]+)"/g, "“$1”")
}
