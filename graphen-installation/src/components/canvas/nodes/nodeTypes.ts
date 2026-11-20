import { AgentNode } from './AgentNode'
import { GroupNode } from './GroupNode'
import { GuardrailNode } from './GuardrailNode'
import { LogicNode } from './LogicNode'
import { McpNode } from './McpNode'
import { MemoryNode } from './MemoryNode'
import { ToolNode } from './ToolNode'

export const nodeTypes = {
  agent: AgentNode,
  mcp: McpNode,
  memory: MemoryNode,
  tool: ToolNode,
  guardrail: GuardrailNode,
  condition: LogicNode,
  action: LogicNode,
  group: GroupNode,
}
