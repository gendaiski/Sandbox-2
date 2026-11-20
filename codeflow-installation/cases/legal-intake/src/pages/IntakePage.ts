import { IntakeForm } from '../components/IntakeForm';
import { useIntake } from '../hooks/useIntake';
export function IntakePage() {
  const state = useIntake();
  return IntakeForm(state);
}
