// Intentionally unsafe sample for static analysis only. Never execute user input.
export function compileFilter(expression) {
  return eval(expression);
}
export function unusedLegacyFilter(items) {
  return items.filter(Boolean);
}
