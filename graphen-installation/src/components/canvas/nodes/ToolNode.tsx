import type { NodeProps } from '@xyflow/react'
import { Wrench } from 'lucide-react'
import { NodeCard } from './NodeCard'
import { nodeText } from './nodeText'

export function ToolNode({ data }: NodeProps) {
  return <NodeCard category="tool" label="Tool" name={nodeText(data.name) ?? 'Tool'} icon={Wrench} detail={nodeText(data.description)} badges={[nodeText(data.mechanism)].filter((value): value is string => Boolean(value))} />
}
