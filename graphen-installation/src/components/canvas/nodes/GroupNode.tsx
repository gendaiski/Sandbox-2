import { Handle, NodeResizer, Position, type NodeProps, type ResizeParams } from '@xyflow/react'
import { Boxes, ChevronDown, ChevronRight } from 'lucide-react'
import { nodeText } from './nodeText'

export function GroupNode({ data, selected }: NodeProps) {
  const collapsed = Boolean(data.collapsed)
  const childCount = typeof data.childCount === 'number' ? data.childCount : null

  const handleResizeEnd = (_: unknown, params: ResizeParams) => {
    if (typeof data.onResizeEnd === 'function') {
      (data.onResizeEnd as (params: ResizeParams) => void)(params)
    }
  }

  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (typeof data.onToggleCollapse === 'function') {
      (data.onToggleCollapse as () => void)()
    }
  }

  if (collapsed) {
    return (
      <div className="graph-group graph-group--collapsed">
        <Handle type="target" position={Position.Left} className="graph-group-handle" />
        <Handle type="target" position={Position.Top} className="graph-group-handle" />
        <Handle type="source" position={Position.Right} className="graph-group-handle" />
        <Handle type="source" position={Position.Bottom} className="graph-group-handle" />
        <div className="graph-group-collapsed-inner">
          <div className="graph-group-header">
            <div className="graph-group-header-left">
              <div className="graph-group-title">
                <Boxes size={16} />
                {nodeText(data.name) ?? 'Group'}
              </div>
              {nodeText(data.description) && (
                <p className="graph-group-collapsed-description">{nodeText(data.description)}</p>
              )}
            </div>
            <button
              className="graph-group-collapse-btn"
              type="button"
              onClick={handleToggleCollapse}
              aria-label="Expand group"
              title="Expand group"
            >
              <ChevronRight size={14} />
            </button>
          </div>
          {childCount !== null && (
            <div className="graph-group-collapsed-badge">
              {childCount} {childCount === 1 ? 'component' : 'components'}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="graph-group">
      <NodeResizer
        isVisible={selected}
        minWidth={280}
        minHeight={150}
        lineClassName="group-resizer-line"
        handleClassName="group-resizer-handle"
        onResizeEnd={handleResizeEnd}
      />
      <div className="graph-group-header">
        <div className="graph-group-header-left">
          <div className="graph-group-title">
            <Boxes size={16} />
            {nodeText(data.name) ?? 'Group'}
          </div>
          {nodeText(data.description) && (
            <span className="graph-group-description">{nodeText(data.description)}</span>
          )}
        </div>
        <button
          className="graph-group-collapse-btn"
          type="button"
          onClick={handleToggleCollapse}
          aria-label="Collapse group"
          title="Collapse group"
        >
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  )
}
