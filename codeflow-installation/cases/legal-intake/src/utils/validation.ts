export function validateIntake(input) {
  if (!input.client || !input.jurisdiction) throw new Error('Client and jurisdiction required');
  return input;
}
