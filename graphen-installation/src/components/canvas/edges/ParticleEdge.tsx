import { BaseEdge, EdgeLabelRenderer, getBezierPath, useInternalNode, type EdgeProps } from '@xyflow/react'
import { getFloatingEdgeParams } from './floatingEdgeUtils'

export function ParticleEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  style,
}: EdgeProps) {
  const sourceNode = useInternalNode(source)
  const targetNode = useInternalNode(target)

  let sx = sourceX
  let sy = sourceY
  let tx = targetX
  let ty = targetY
  let sp = sourcePosition
  let tp = targetPosition

  if (sourceNode && targetNode) {
    const params = getFloatingEdgeParams(sourceNode, targetNode)
    if (params) {
      sx = params.sx
      sy = params.sy
      tx = params.tx
      ty = params.ty
      sp = params.sourcePos
      tp = params.targetPos
    }
  }

  const [path, labelX, labelY] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    targetX: tx,
    targetY: ty,
    sourcePosition: sp,
    targetPosition: tp,
  })

  const labelStr = typeof label === 'string' ? label : undefined

  return (
    <>
      <BaseEdge id={id} path={path} style={style} />
      {labelStr && (
        <EdgeLabelRenderer>
          <div
            className="edge-label-renderer"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            {labelStr}
          </div>
        </EdgeLabelRenderer>
      )}
      <circle className="edge-particle" r="3" fill="var(--accent)">
        <animateMotion dur="3s" repeatCount="indefinite" path={path} />
      </circle>
    </>
  )
}
