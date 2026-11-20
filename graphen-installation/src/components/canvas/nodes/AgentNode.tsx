import type { NodeProps } from '@xyflow/react'
import { Bot } from 'lucide-react'
import { NodeCard } from './NodeCard'
import { nodeText } from './nodeText'

export function AgentNode({ data }: NodeProps) {
  const model = data.modelDetails
  const modelName = model && typeof model === 'object' && 'model' in model ? nodeText(model.model) : undefined
  const badges = [modelName, data.version != null ? `v${nodeText(data.version)}` : undefined]
    .filter((badge): badge is string => Boolean(badge))

  return <NodeCard category="agent" label="Agent" name={nodeText(data.name) ?? 'Agent'} icon={Bot} detail={nodeText(data.role)} badges={badges} />
}
