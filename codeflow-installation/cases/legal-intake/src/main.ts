import { IntakePage } from './pages/IntakePage';
import { createIntake } from './services/intake';
export async function main() {
  const input = IntakePage();
  return createIntake(input);
}
main();
