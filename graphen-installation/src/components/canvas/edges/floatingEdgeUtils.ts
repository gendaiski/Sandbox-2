import { Position, type InternalNode } from '@xyflow/react'

function getNodeCenter(node: InternalNode) {
  const x = (node.internals?.positionAbsolute?.x ?? node.position?.x ?? 0)
    + ((node.measured?.width ?? (typeof node.width === 'number' ? node.width : 240)) / 2)
  const y = (node.internals?.positionAbsolute?.y ?? node.position?.y ?? 0)
    + ((node.measured?.height ?? (typeof node.height === 'number' ? node.height : 116)) / 2)
  return { x, y }
}

function getParams(nodeA: InternalNode, nodeB: InternalNode): [number, number, Position] {
  const centerA = getNodeCenter(nodeA)
  const centerB = getNodeCenter(nodeB)

  const horizontalDiff = Math.abs(centerA.x - centerB.x)
  const verticalDiff = Math.abs(centerA.y - centerB.y)

  let position: Position

  if (horizontalDiff > verticalDiff) {
    position = centerA.x > centerB.x ? Position.Left : Position.Right
  } else {
    position = centerA.y > centerB.y ? Position.Top : Position.Bottom
  }

  const [x, y] = getHandleCoords(nodeA, position)
  return [x, y, position]
}

function getHandleCoords(node: InternalNode, handlePosition: Position): [number, number] {
  const handle = node.internals?.handleBounds?.source?.find((h) => h.position === handlePosition)
    ?? node.internals?.handleBounds?.target?.find((h) => h.position === handlePosition)

  const posX = node.internals?.positionAbsolute?.x ?? node.position?.x ?? 0
  const posY = node.internals?.positionAbsolute?.y ?? node.position?.y ?? 0
  const w = node.measured?.width ?? (typeof node.width === 'number' ? node.width : 240)
  const h = node.measured?.height ?? (typeof node.height === 'number' ? node.height : 116)

  if (!handle) {
    let fallbackX = posX
    let fallbackY = posY

    switch (handlePosition) {
      case Position.Left:
        fallbackY += h / 2
        break
      case Position.Right:
        fallbackX += w
        fallbackY += h / 2
        break
      case Position.Top:
        fallbackX += w / 2
        break
      case Position.Bottom:
        fallbackX += w / 2
        fallbackY += h
        break
    }
    return [fallbackX, fallbackY]
  }

  let offsetX = handle.width / 2
  let offsetY = handle.height / 2

  switch (handlePosition) {
    case Position.Left:
      offsetX = 0
      break
    case Position.Right:
      offsetX = handle.width
      break
    case Position.Top:
      offsetY = 0
      break
    case Position.Bottom:
      offsetY = handle.height
      break
  }

  return [
    posX + handle.x + offsetX,
    posY + handle.y + offsetY,
  ]
}

export function getFloatingEdgeParams(sourceNode: InternalNode, targetNode: InternalNode) {
  const [sx, sy, sourcePos] = getParams(sourceNode, targetNode)
  const [tx, ty, targetPos] = getParams(targetNode, sourceNode)

  if (!Number.isFinite(sx) || !Number.isFinite(sy) || !Number.isFinite(tx) || !Number.isFinite(ty)) {
    return null
  }

  return {
    sx,
    sy,
    tx,
    ty,
    sourcePos,
    targetPos,
  }
}

