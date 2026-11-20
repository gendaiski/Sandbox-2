import type { NodeProps } from '@xyflow/react'
import { Database } from 'lucide-react'
import { NodeCard } from './NodeCard'
import { nodeText } from './nodeText'

export function MemoryNode({ data }: NodeProps) {
  return <NodeCard category="memory" label="Memory" name={nodeText(data.name) ?? 'Memory'} icon={Database} detail={nodeText(data.provider)} badges={[nodeText(data.mode)].filter((value): value is string => Boolean(value))} />
}
