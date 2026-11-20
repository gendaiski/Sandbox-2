import type { NodeProps } from '@xyflow/react'
import { PlugZap } from 'lucide-react'
import { NodeCard } from './NodeCard'
import { nodeText } from './nodeText'

export function McpNode({ data }: NodeProps) {
  return <NodeCard category="mcp" label="MCP" name={nodeText(data.name) ?? 'MCP'} icon={PlugZap} detail={nodeText(data.endpoint)} badges={[nodeText(data.protocol)].filter((value): value is string => Boolean(value))} />
}
