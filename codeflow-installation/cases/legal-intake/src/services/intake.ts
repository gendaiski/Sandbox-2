import { validateIntake } from '../utils/validation';
import { saveMatter } from '../repositories/matters';
import { publish } from './events';
export async function createIntake(input) {
  const validated = validateIntake(input);
  const matter = await saveMatter(validated);
  publish('matter.created', matter);
  return matter;
}
