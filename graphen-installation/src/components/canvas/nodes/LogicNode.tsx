import type { NodeProps } from '@xyflow/react'
import { GitFork, Zap } from 'lucide-react'
import { NodeCard } from './NodeCard'
import { nodeText } from './nodeText'

export function LogicNode({ data, type }: NodeProps) {
  const isCondition = type === 'condition'
  return (
    <NodeCard
      category="logic"
      label={isCondition ? 'Condition' : 'Action'}
      name={nodeText(data.name) ?? 'Logic'}
      icon={isCondition ? GitFork : Zap}
      detail={nodeText(isCondition ? data.expression : data.action_type)}
    />
  )
}
