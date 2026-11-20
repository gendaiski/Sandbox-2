import { z } from 'zod'

const id = z.string().trim().min(1)
const text = z.string().trim().min(1)

const named = {
  id,
  name: text,
  description: z.string().optional(),
  group: id.optional(),
}

const modelSchema = z.looseObject({
  id,
  provider: text,
  model: text,
  temperature: z.number().min(0).max(2).optional(),
  reasoning_capability: z.string().optional(),
})

const groupSchema = z.looseObject({
  id,
  name: text,
  description: z.string().optional(),
})

const agentSchema = z.looseObject({
  ...named,
  role: z.string().optional(),
  version: z.union([z.string(), z.number()]).optional(),
  model: id.optional(),
  tools: z.array(id).optional(),
  guardrails: z.array(id).optional(),
  memory: z.array(id).optional(),
})

const mcpSchema = z.looseObject({
  ...named,
  protocol: z.string().optional(),
  endpoint: z.string().optional(),
})

const memorySchema = z.looseObject({
  ...named,
  provider: z.string().optional(),
  mode: z.string().optional(),
})

const toolSchema = z.looseObject({
  ...named,
  mechanism: z.string().optional(),
  endpoint: z.string().optional(),
})

const guardrailSchema = z.looseObject({
  ...named,
  mechanism: z.string().optional(),
  human_in_the_loop: z.boolean().optional(),
})

const componentSchema = z.looseObject({
  ...named,
  type: z.enum(['condition', 'action']),
  expression: z.string().optional(),
  action_type: z.string().optional(),
})

const topologySchema = z.looseObject({
  from: id,
  to: id,
  label: z.string().optional(),
})

export const aalSchema = z.strictObject({
  version: text,
  metadata: z.looseObject({
    name: text,
    description: z.string().optional(),
    owner: z.string().optional(),
    cost_center: z.string().optional(),
    sla: z.string().optional(),
  }),
  models: z.array(modelSchema).optional(),
  groups: z.array(groupSchema).optional(),
  agents: z.array(agentSchema).optional(),
  mcps: z.array(mcpSchema).optional(),
  memories: z.array(memorySchema).optional(),
  tools: z.array(toolSchema).optional(),
  guardrails: z.array(guardrailSchema).optional(),
  components: z.array(componentSchema).optional(),
  topology: z.array(topologySchema).optional(),
}).superRefine((document, context) => {
  const models = new Set<string>()
  const groups = new Set<string>()
  const nodes = new Set<string>()
  const tools = new Set<string>()
  const memories = new Set<string>()
  const guardrails = new Set<string>()

  const issue = (path: (string | number)[], message: string) => {
    context.addIssue({ code: 'custom', path, message })
  }

  for (const [section, items, ids] of [
    ['models', document.models, models],
    ['groups', document.groups, groups],
  ] as const) {
    items?.forEach((item, index) => {
      if (ids.has(item.id)) issue([section, index, 'id'], `Duplicate ${section} ID "${item.id}"`)
      ids.add(item.id)
    })
  }

  for (const section of ['agents', 'mcps', 'memories', 'tools', 'guardrails', 'components'] as const) {
    document[section]?.forEach((item, index) => {
      if (nodes.has(item.id) || groups.has(item.id)) {
        issue([section, index, 'id'], `Duplicate component ID "${item.id}"`)
      }
      nodes.add(item.id)
      if (item.group && !groups.has(item.group)) {
        issue([section, index, 'group'], `Unknown group "${item.group}"`)
      }
      if (section === 'mcps' || section === 'tools') tools.add(item.id)
      if (section === 'memories') memories.add(item.id)
      if (section === 'guardrails') guardrails.add(item.id)
    })
  }

  document.agents?.forEach((agent, index) => {
    if (agent.model && !models.has(agent.model)) {
      issue(['agents', index, 'model'], `Unknown model "${agent.model}"`)
    }
    for (const [field, ids, label] of [
      ['tools', tools, 'tool or MCP'],
      ['memory', memories, 'memory'],
      ['guardrails', guardrails, 'guardrail'],
    ] as const) {
      agent[field]?.forEach((reference, referenceIndex) => {
        if (!ids.has(reference)) {
          issue(['agents', index, field, referenceIndex], `Unknown ${label} "${reference}"`)
        }
      })
    }
  })

  document.topology?.forEach((edge, index) => {
    if (!nodes.has(edge.from)) issue(['topology', index, 'from'], `Unknown component "${edge.from}"`)
    if (!nodes.has(edge.to)) issue(['topology', index, 'to'], `Unknown component "${edge.to}"`)
  })
})

export type AalDocument = z.infer<typeof aalSchema>
export type AalMetadata = AalDocument['metadata']
export type AalAgent = NonNullable<AalDocument['agents']>[number]
export type AalModel = NonNullable<AalDocument['models']>[number]
