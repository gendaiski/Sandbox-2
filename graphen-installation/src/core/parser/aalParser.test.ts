import { describe, expect, it } from 'vitest'
import sampleSource from '../../assets/sample.aal.yaml?raw'
import type { LayoutDirection } from '../types/graph'
import { AalParseError, parseAal, resolveAgentModel } from './aalParser'
import { transformAalToGraph } from './graphTransformer'

const example = `
version: "1.1"
metadata:
  name: Support System
  owner: Architecture Team
models:
  - id: model_1
    provider: anthropic
    model: claude-sonnet
groups:
  - id: cluster
    name: Support Cluster
agents:
  - id: supervisor
    name: Supervisor
    model: model_1
    tools: [database, lookup]
    guardrails: [approval]
  - id: specialist
    name: Specialist
    group: cluster
    memory: [knowledge]
mcps:
  - id: database
    name: Database
    group: cluster
memories:
  - id: knowledge
    name: Knowledge Base
    group: cluster
tools:
  - id: lookup
    name: Lookup
guardrails:
  - id: approval
    name: Approval
    human_in_the_loop: true
components:
  - id: check
    name: Check
    type: condition
topology:
  - from: supervisor
    to: specialist
    label: Delegates
  - from: specialist
    to: database
    label: Queries
  - from: database
    to: knowledge
`

describe('parseAal', () => {
  it('accepts valid YAML, preserves metadata, and resolves model references', () => {
    const document = parseAal(example)

    expect(document.metadata.owner).toBe('Architecture Team')
    expect(resolveAgentModel(document, document.agents![0])).toMatchObject({ id: 'model_1', provider: 'anthropic' })
  })

  it('reports syntax errors with a line number', () => {
    expect(() => parseAal('metadata: [\n')).toThrow(/Line \d+, column \d+/)
    try {
      parseAal('metadata: [\n')
    } catch (error) {
      expect(error).toBeInstanceOf(AalParseError)
      expect((error as AalParseError).location).toEqual({ line: 2, column: 1 })
    }
  })

  it('reports broken model, component, group and topology references', () => {
    const invalid = example
      .replace('model: model_1', 'model: missing_model')
      .replace('tools: [database, lookup]', 'tools: [missing_tool]')
      .replace('group: cluster', 'group: missing_group')
      .replace('to: knowledge', 'to: missing_node')

    try {
      parseAal(invalid)
      throw new Error('Expected invalid AAL to fail')
    } catch (error) {
      expect(error).toBeInstanceOf(AalParseError)
      expect((error as AalParseError).issues).toEqual(expect.arrayContaining([
        expect.stringContaining('agents[0].model: Unknown model "missing_model"'),
        expect.stringContaining('agents[0].tools[0]: Unknown tool or MCP "missing_tool"'),
        expect.stringContaining('agents[1].group: Unknown group "missing_group"'),
        expect.stringContaining('topology[2].to: Unknown component "missing_node"'),
      ]))
    }
  })

  it('rejects duplicate component IDs across categories and invalid field types', () => {
    expect(() => parseAal(example.replace('id: lookup', 'id: supervisor')))
      .toThrow(/tools\[0\]\.id: Duplicate component ID "supervisor"/)
    expect(() => parseAal(example.replace('human_in_the_loop: true', 'human_in_the_loop: yes')))
      .toThrow(/guardrails\[0\]\.human_in_the_loop/)
  })

  it('rejects unknown top-level sections instead of silently dropping them', () => {
    expect(() => parseAal('version: "1.1"\nmetadata:\n  name: Empty\nagent: []'))
      .toThrow(/Unrecognized key: "agent"/)
  })

  it('allows an architecture without optional categories', () => {
    expect(parseAal('version: "1.1"\nmetadata:\n  name: Empty')).toMatchObject({
      version: '1.1', metadata: { name: 'Empty' },
    })
  })
})

describe('transformAalToGraph', () => {
  it('positions grouped nodes inside their parent and creates labeled particle edges', () => {
    const graph = transformAalToGraph(parseAal(example))
    const group = graph.nodes.find((node) => node.id === 'cluster')!
    const child = graph.nodes.find((node) => node.id === 'specialist')!
    const agent = graph.nodes.find((node) => node.id === 'supervisor')!

    expect(graph.nodes.indexOf(group)).toBeLessThan(graph.nodes.indexOf(child))
    expect(child.parentId).toBe('cluster')
    expect(child.position.x).toBeGreaterThan(0)
    expect(child.position.x + 240).toBeLessThanOrEqual(Number(group.style?.width))
    expect(child.position.y + 116).toBeLessThanOrEqual(Number(group.style?.height))
    expect(agent.data.modelDetails).toMatchObject({ id: 'model_1' })
    expect(graph.edges).toHaveLength(3)
    expect(graph.edges[0]).toMatchObject({ source: 'supervisor', target: 'specialist', label: 'Delegates', type: 'particle' })
    expect(graph.edges[1]).toMatchObject({ source: 'specialist', target: 'database', label: 'Queries' })
    expect(group.position.x).toBeGreaterThanOrEqual(0)
  })

  it('handles a document with no nodes or connections', () => {
    expect(transformAalToGraph(parseAal('version: "1.1"\nmetadata:\n  name: Empty')))
      .toEqual({ nodes: [], edges: [] })
  })

  it('renders the versioned Studio sample with all supported node types', () => {
    const graph = transformAalToGraph(parseAal(sampleSource))
    expect(new Set(graph.nodes.map((node) => node.type))).toEqual(new Set([
      'agent', 'mcp', 'memory', 'tool', 'guardrail', 'condition', 'action', 'group',
    ]))
    expect(graph.edges).toHaveLength(7)
  })

  it.each(['LR', 'RL', 'TB', 'BT'] as LayoutDirection[])('lays out nodes and groups in %s', (direction) => {
    const graph = transformAalToGraph(parseAal(sampleSource), direction)
    const nodes = new Map(graph.nodes.map((node) => [node.id, node]))
    const supervisor = nodes.get('supervisor')!
    const group = nodes.get('technical_support')!
    const specialist = nodes.get('specialist')!
    const database = nodes.get('customer_db')!

    const axis = direction === 'LR' || direction === 'RL' ? 'x' : 'y'
    const sign = direction === 'LR' || direction === 'TB' ? 1 : -1
    expect((group.position[axis] - supervisor.position[axis]) * sign).toBeGreaterThan(0)
    expect((database.position[axis] - specialist.position[axis]) * sign).toBeGreaterThan(0)

    for (const node of graph.nodes.filter((item) => item.parentId === group.id)) {
      expect(node.position.x).toBeGreaterThanOrEqual(0)
      expect(node.position.y).toBeGreaterThanOrEqual(56)
      expect(node.position.x + 240).toBeLessThanOrEqual(Number(group.style?.width))
      expect(node.position.y + 116).toBeLessThanOrEqual(Number(group.style?.height))
    }
  })
})
