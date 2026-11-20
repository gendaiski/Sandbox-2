import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Background, ConnectionMode, Controls, ReactFlow, ReactFlowProvider, useEdgesState, useNodesState } from '@xyflow/react'
import type { Edge, Node, NodeChange, ReactFlowInstance } from '@xyflow/react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, PanelLeftClose, PanelLeftOpen, RotateCcw } from 'lucide-react'
import { transformAalToGraph } from '../../core/parser/graphTransformer'
import type { AalDocument } from '../../core/types/aal.schema'
import { useStudioStore } from '../../store/useStudioStore'
import { NodeDetails } from './NodeDetails'
import { MetadataInfoPopover } from './MetadataInfoPopover'
import { ParticleEdge } from './edges/ParticleEdge'
import { exportGraph, type ExportFormat } from './exportGraph'
import { nodeTypes } from './nodes/nodeTypes'

const edgeTypes = { particle: ParticleEdge }
const directions = [
  { value: 'LR', label: 'Left to right', icon: ArrowRight },
  { value: 'RL', label: 'Right to left', icon: ArrowLeft },
  { value: 'TB', label: 'Top to bottom', icon: ArrowDown },
  { value: 'BT', label: 'Bottom to top', icon: ArrowUp },
] as const

type Props = {
  document: AalDocument
  status: string
  editorVisible: boolean
  onToggleEditor: () => void
}

type StoredNodeLayout = {
  x: number
  y: number
  width?: number
  height?: number
}

type StoredLayout = Record<string, StoredNodeLayout>

function getPositionsStorageKey(docName: string, direction: string): string {
  return `graphen-positions:${docName}:${direction}`
}

function getCollapsedStorageKey(docName: string): string {
  return `graphen-collapsed:${docName}`
}

function loadCollapsedGroups(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key)
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set()
  } catch {
    return new Set()
  }
}

function saveCollapsedGroups(key: string, collapsed: Set<string>) {
  try {
    if (collapsed.size === 0) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify([...collapsed]))
    }
  } catch {
    // Ignore localStorage errors
  }
}

function loadStoredLayout(key: string): StoredLayout {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveStoredLayout(key: string, layout: StoredLayout) {
  try {
    if (Object.keys(layout).length === 0) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(layout))
    }
  } catch {
    // Ignore localStorage errors (quota or private mode)
  }
}

type CanvasContentProps = {
  document: AalDocument
  direction: (typeof directions)[number]['value']
  storageKey: string
  collapsedStorageKey: string
  theme: 'dark' | 'light'
  setSelectedId: (id: string | null) => void
  onInit: (instance: ReactFlowInstance) => void
  onPositionsChange: (hasCustom: boolean) => void
  onSelectedNodeChange: (node: Node | null) => void
}

function FlowCanvas({
  document,
  direction,
  storageKey,
  collapsedStorageKey,
  setSelectedId,
  onInit,
  onPositionsChange,
  onSelectedNodeChange,
}: CanvasContentProps) {
  const flowInstanceRef = useRef<ReactFlowInstance | null>(null)
  const graph = useMemo(() => transformAalToGraph(document, direction), [document, direction])
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    () => loadCollapsedGroups(collapsedStorageKey)
  )

  const initialNodes = useMemo(() => {
    const stored = loadStoredLayout(storageKey)
    return graph.nodes.map((node) => {
      const saved = stored[node.id]
      const width = saved?.width ?? (node.width != null ? Number(node.width) : node.style?.width ? Number(node.style.width) : undefined)
      const height = saved?.height ?? (node.height != null ? Number(node.height) : node.style?.height ? Number(node.style.height) : undefined)

      return {
        ...node,
        position: saved ? { x: saved.x, y: saved.y } : node.position,
        ...(width != null ? { width } : {}),
        ...(height != null ? { height } : {}),
        style: {
          ...node.style,
          ...(width != null ? { width } : {}),
          ...(height != null ? { height } : {}),
        },
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only used at mount; ongoing sync handled by the useEffect below

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(graph.edges)

  // Keep nodes and edges synchronized when document/graph or direction updates
  useEffect(() => {
    const stored = loadStoredLayout(storageKey)
    setNodes((current) => {
      // Build a map of current positions so we don't lose drag state for
      // nodes that still exist in the new graph.
      const currentMap = new Map(current.map((n) => [n.id, n]))
      return graph.nodes.map((node) => {
        const saved = stored[node.id]
        const existing = currentMap.get(node.id)
        const width = saved?.width ?? (node.width != null ? Number(node.width) : node.style?.width ? Number(node.style.width) : undefined)
        const height = saved?.height ?? (node.height != null ? Number(node.height) : node.style?.height ? Number(node.style.height) : undefined)

        return {
          ...node,
          // Prefer saved position, then current dragged position, then graph default
          position: saved ? { x: saved.x, y: saved.y } : (existing?.position ?? node.position),
          ...(width != null ? { width } : {}),
          ...(height != null ? { height } : {}),
          style: {
            ...node.style,
            ...(width != null ? { width } : {}),
            ...(height != null ? { height } : {}),
          },
        }
      })
    })
    setEdges(graph.edges)
  }, [graph, storageKey, setNodes, setEdges])

  // Collapsed group dimensions — match the standard component node size
  const COLLAPSED_WIDTH = 240
  const COLLAPSED_HEIGHT = 116

  const handleToggleCollapse = useCallback((groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      saveCollapsedGroups(collapsedStorageKey, next)
      return next
    })
  }, [collapsedStorageKey])

  // Attach onResizeEnd and onToggleCollapse callbacks to group nodes; hide children of collapsed groups
  const nodesWithCallbacks = useMemo(() => {
    // Pre-compute child counts per group
    const childCounts = new Map<string, number>()
    for (const n of nodes) {
      if (n.parentId) childCounts.set(n.parentId, (childCounts.get(n.parentId) ?? 0) + 1)
    }

    return nodes.map((node) => {
      // Hide children of collapsed groups
      if (node.type !== 'group' && node.parentId && collapsedGroups.has(node.parentId)) {
        return { ...node, hidden: true }
      }

      if (node.type !== 'group') return node

      const isCollapsed = collapsedGroups.has(node.id)

      return {
        ...node,
        // Override size when collapsed so the node shrinks to a compact card
        ...(isCollapsed
          ? { width: COLLAPSED_WIDTH, height: COLLAPSED_HEIGHT, style: { ...node.style, width: COLLAPSED_WIDTH, height: COLLAPSED_HEIGHT } }
          : {}),
        data: {
          ...node.data,
          collapsed: isCollapsed,
          childCount: childCounts.get(node.id) ?? 0,
          onToggleCollapse: () => handleToggleCollapse(node.id),
          onResizeEnd: (params: { width: number; height: number; x: number; y: number }) => {
            const width = Math.round(params.width)
            const height = Math.round(params.height)
            const x = Math.round(params.x)
            const y = Math.round(params.y)

            setNodes((current) =>
              current.map((n) =>
                n.id === node.id
                  ? {
                      ...n,
                      position: { x, y },
                      width,
                      height,
                      style: { ...n.style, width, height },
                    }
                  : n,
              ),
            )

            const currentStored = loadStoredLayout(storageKey)
            currentStored[node.id] = {
              x,
              y,
              width,
              height,
            }
            saveStoredLayout(storageKey, currentStored)
            onPositionsChange(true)
          },
        },
      }
    })
  }, [nodes, storageKey, collapsedGroups, setNodes, onPositionsChange, handleToggleCollapse])

  // Redirect edges: when source/target is a hidden child, point to its parent group instead
  const edgesWithCollapse = useMemo(() => {
    // Build a map of nodeId -> parentId for quick lookup
    const parentMap = new Map<string, string>()
    for (const n of nodes) {
      if (n.parentId) parentMap.set(n.id, n.parentId)
    }
    return edges.map((edge) => {
      const sourceParent = parentMap.get(edge.source)
      const targetParent = parentMap.get(edge.target)
      const newSource = (sourceParent && collapsedGroups.has(sourceParent)) ? sourceParent : edge.source
      const newTarget = (targetParent && collapsedGroups.has(targetParent)) ? targetParent : edge.target
      if (newSource === newTarget) return { ...edge, hidden: true }
      return { ...edge, source: newSource, target: newTarget, hidden: false }
    })
  }, [edges, nodes, collapsedGroups])

  // Handle position and dimension changes and save without causing full rerenders
  const handleNodesChange = (changes: NodeChange<Node>[]) => {
    onNodesChange(changes)

    const hasLayoutChanges = changes.some(
      (c) => (c.type === 'position' && c.position) || c.type === 'dimensions',
    )
    if (hasLayoutChanges && flowInstanceRef.current) {
      const latestNodes = flowInstanceRef.current.getNodes()
      const layoutToSave: StoredLayout = {}
      for (const n of latestNodes) {
        const width = n.width != null ? Number(n.width) : n.style?.width != null ? Number(n.style.width) : undefined
        const height = n.height != null ? Number(n.height) : n.style?.height != null ? Number(n.style.height) : undefined
        layoutToSave[n.id] = {
          x: n.position.x,
          y: n.position.y,
          ...(width != null ? { width } : {}),
          ...(height != null ? { height } : {}),
        }
      }
      saveStoredLayout(storageKey, layoutToSave)
      onPositionsChange(true)
    }
  }

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedId(node.id)
  }

  const handleNodeDoubleClick = (_: React.MouseEvent, node: Node) => {
    setSelectedId(node.id)
    onSelectedNodeChange(node)
  }

  const handlePaneClick = () => {
    setSelectedId(null)
    onSelectedNodeChange(null)
  }

  return (
    <ReactFlow<Node, Edge>
      nodes={nodesWithCallbacks}
      edges={edgesWithCollapse}
      onNodesChange={handleNodesChange}
      onEdgesChange={onEdgesChange}
      connectionMode={ConnectionMode.Loose}
      onInit={(instance) => {
        flowInstanceRef.current = instance
        onInit(instance)
      }}
      onNodeClick={handleNodeClick}
      onNodeDoubleClick={handleNodeDoubleClick}
      onPaneClick={handlePaneClick}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      nodesDraggable={true}
      panActivationKeyCode={null}
      fitView
      fitViewOptions={{ padding: 0.18, maxZoom: 1 }}
      minZoom={0.15}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
    >
      <Background color="var(--canvas-grid)" gap={24} size={1} />
      <Controls showInteractive={false} />
    </ReactFlow>
  )
}

export function CanvasPanel({ document, status, editorVisible, onToggleEditor }: Props) {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const flowRef = useRef<ReactFlowInstance | null>(null)
  const direction = useStudioStore((state) => state.layoutDirection)
  const setDirection = useStudioStore((state) => state.setLayoutDirection)
  const theme = useStudioStore((state) => state.theme)
  const sharedLayoutScope = useStudioStore((state) => state.sharedLayoutScope)
  const storageKey = sharedLayoutScope
    ? `graphen-shared-positions:${sharedLayoutScope}:${document.metadata.name}:${direction}`
    : getPositionsStorageKey(document.metadata.name, direction)
  const collapsedStorageKey = getCollapsedStorageKey(document.metadata.name)

  const [hasCustomPositions, setHasCustomPositions] = useState(() => {
    return Object.keys(loadStoredLayout(storageKey)).length > 0
  })

  // Track storageKey change to sync hasCustomPositions
  const [trackedKey, setTrackedKey] = useState(storageKey)
  if (trackedKey !== storageKey) {
    setTrackedKey(storageKey)
    setHasCustomPositions(Object.keys(loadStoredLayout(storageKey)).length > 0)
    setSelectedNode(null)
  }

  const [resetCount, setResetCount] = useState(0)

  const handleResetLayout = () => {
    saveStoredLayout(storageKey, {})
    setHasCustomPositions(false)
    setResetCount((c) => c + 1)
    window.requestAnimationFrame(() => {
      flowRef.current?.fitView({ padding: 0.18 })
    })
  }

  const graph = useMemo(() => transformAalToGraph(document, direction), [document, direction])

  async function handleExport(format: ExportFormat) {
    if (!flowRef.current || !containerRef.current || exporting) return
    setExportError(null)
    setExporting(true)
    try {
      await exportGraph(flowRef.current, containerRef.current, format, theme)
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Could not export the image.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <section className="canvas-panel" aria-label="Architecture canvas">
      <div className="panel-heading canvas-heading">
        <div className="canvas-heading-title">
          <span title={document.metadata.name}>{document.metadata.name}</span>
          <MetadataInfoPopover metadata={document.metadata} />
        </div>
        <div className="canvas-heading-actions">
          <span className="canvas-status">{status}</span>
          <button
            className="panel-toggle"
            type="button"
            onClick={onToggleEditor}
            aria-controls="graphen-editor"
            aria-expanded={editorVisible}
            aria-label={editorVisible ? 'Hide editor' : 'Show editor'}
            title={editorVisible ? 'Hide editor' : 'Show editor'}
          >
            {editorVisible ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
          </button>
          <div className="direction-switcher" role="group" aria-label="Graph direction">
            {directions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                className="direction-button"
                aria-label={label}
                title={label}
                aria-pressed={direction === value}
                onClick={() => setDirection(value)}
              >
                <Icon size={15} aria-hidden="true" />
              </button>
            ))}
          </div>
          <button
            type="button"
            className="panel-toggle"
            disabled={!hasCustomPositions}
            onClick={handleResetLayout}
            title="Reset to automatic layout"
            aria-label="Reset layout"
          >
            <RotateCcw size={15} />
          </button>
          <div className="export-actions" role="group" aria-label="Export architecture">
            <button type="button" disabled={exporting || !graph.nodes.length} onClick={() => void handleExport('png')} title="Export PNG at 2× resolution">PNG</button>
            <button type="button" disabled={exporting || !graph.nodes.length} onClick={() => void handleExport('svg')} title="Export SVG">SVG</button>
          </div>
        </div>
      </div>
      <div className="canvas-body" ref={containerRef}>
        <ReactFlowProvider>
          <FlowCanvas
            key={`${storageKey}-${resetCount}`}
            document={document}
            direction={direction}
            storageKey={storageKey}
            collapsedStorageKey={collapsedStorageKey}
            theme={theme}
            setSelectedId={(id) => { if (id === null) setSelectedNode(null) }}
            onInit={(instance) => { flowRef.current = instance }}
            onPositionsChange={setHasCustomPositions}
            onSelectedNodeChange={setSelectedNode}
          />
        </ReactFlowProvider>
        {!graph.nodes.length && <div className="canvas-empty">Add components in the editor to see your architecture.</div>}
        <div className="canvas-navigation-hint">Drag to arrange <span aria-hidden="true">·</span> Double-click for details <span aria-hidden="true">·</span> Scroll to zoom</div>
        {exportError && <div className="canvas-export-error" role="alert">{exportError}</div>}
        {selectedNode && (
          <NodeDetails
            node={selectedNode}
            onClose={() => {
              setSelectedNode(null)
            }}
          />
        )}
      </div>
    </section>
  )
}
