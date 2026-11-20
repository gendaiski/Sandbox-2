import type { NodeProps } from '@xyflow/react'
import { ShieldCheck } from 'lucide-react'
import { NodeCard } from './NodeCard'
import { nodeText } from './nodeText'

export function GuardrailNode({ data }: NodeProps) {
  const approval = data.human_in_the_loop === true ? 'Human approval' : data.human_in_the_loop === false ? 'Automated' : undefined
  return <NodeCard category="guardrail" label="Guardrail" name={nodeText(data.name) ?? 'Guardrail'} icon={ShieldCheck} detail={nodeText(data.mechanism)} badges={approval ? [approval] : []} />
}
