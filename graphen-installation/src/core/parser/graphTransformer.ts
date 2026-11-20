import dagre from '@dagrejs/dagre'
import type { Edge, Node } from '@xyflow/react'
import type { AalDocument } from '../types/aal.schema'
import type { LayoutDirection } from '../types/graph'
import { resolveAgentModel } from './aalParser'

export type AalGraph = { nodes: Node[]; edges: Edge[] }

const nodeWidth = 240
const nodeHeight = 116
const groupPadding = 24
const groupHeader = 56

function layout(nodes: Node[], edges: { source: string; target: string }[], direction: LayoutDirection) {
  const graph = new dagre.graphlib.Graph()
  graph.setGraph({ rankdir: direction, ranksep: 90, nodesep: 40 })
  graph.setDefaultEdgeLabel(() => ({}))

  for (const node of nodes) {
    graph.setNode(node.id, {
      width: Number(node.style?.width) || nodeWidth,
      height: Number(node.style?.height) || nodeHeight,
    })
  }
  for (const edge of edges) graph.setEdge(edge.source, edge.target)

  dagre.layout(graph)
  return graph
}

export function transformAalToGraph(document: AalDocument, direction: LayoutDirection = 'LR'): AalGraph {
  const components: Node[] = []

  for (const [section, type] of [
    ['agents', 'agent'],
    ['mcps', 'mcp'],
    ['memories', 'memory'],
    ['tools', 'tool'],
    ['guardrails', 'guardrail'],
  ] as const) {
    document[section]?.forEach((item) => {
      const model = section === 'agents' ? resolveAgentModel(document, item) : undefined
      components.push({
        id: item.id,
        type,
        parentId: item.group,
        position: { x: 0, y: 0 },
        style: { width: nodeWidth, height: nodeHeight },
        data: { ...item, label: item.name, ...(model && { modelDetails: model }) },
      })
    })
  }

  document.components?.forEach((item) => {
    components.push({
      id: item.id,
      type: item.type,
      parentId: item.group,
      position: { x: 0, y: 0 },
      style: { width: nodeWidth, height: nodeHeight },
      data: { ...item, label: item.name },
    })
  })

  const byId = new Map(components.map((node) => [node.id, node]))
  const topology = document.topology ?? []
  const groups: Node[] = []

  for (const group of document.groups ?? []) {
    const children = components.filter((node) => node.parentId === group.id)
    const childIds = new Set(children.map((node) => node.id))
    const internalEdges = topology.filter((edge) => childIds.has(edge.from) && childIds.has(edge.to))
      .map((edge) => ({ source: edge.from, target: edge.to }))
    const graph = layout(children, internalEdges, direction)

    for (const child of children) {
      const position = graph.node(child.id)
      child.position = {
        x: position.x - nodeWidth / 2 + groupPadding,
        y: position.y - nodeHeight / 2 + groupHeader,
      }
    }

    const width = Math.max(280, (graph.graph().width ?? 0) + groupPadding * 2)
    const height = Math.max(150, (graph.graph().height ?? 0) + groupHeader + groupPadding)
    groups.push({
      id: group.id,
      type: 'group',
      position: { x: 0, y: 0 },
      style: { width, height },
      data: { ...group, label: group.name },
    })
  }

  const outerNodes = [...groups, ...components.filter((node) => !node.parentId)]
  const outerEdges = topology.flatMap((edge) => {
    const source = byId.get(edge.from)?.parentId ?? edge.from
    const target = byId.get(edge.to)?.parentId ?? edge.to
    return source === target ? [] : [{ source, target }]
  })
  const outerGraph = layout(outerNodes, outerEdges, direction)

  for (const node of outerNodes) {
    const position = outerGraph.node(node.id)
    const width = Number(node.style?.width) || nodeWidth
    const height = Number(node.style?.height) || nodeHeight
    node.position = { x: position.x - width / 2, y: position.y - height / 2 }
  }

  return {
    // React Flow needs parents before their children.
    nodes: [...groups, ...components],
    edges: topology.map((edge, index) => ({
      id: `topology-${index}`,
      source: edge.from,
      target: edge.to,
      label: edge.label,
      type: 'particle',
      style: { stroke: 'var(--accent)', strokeWidth: 1.75 },
    })),
  }
}
