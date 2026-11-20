import { formatName } from '../utils/format';
export function IntakeForm(state) {
  return { client: formatName(state.client), jurisdiction: 'EG', matter: 'Contract review' };
}
