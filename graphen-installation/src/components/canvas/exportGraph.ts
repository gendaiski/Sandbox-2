import type { ReactFlowInstance } from '@xyflow/react'
import { toBlob, toSvg } from 'html-to-image'

export type ExportFormat = 'png' | 'svg'

export async function exportGraph(
  instance: ReactFlowInstance,
  container: HTMLElement,
  format: ExportFormat,
  theme: 'dark' | 'light',
) {
  const viewport = container.querySelector<HTMLElement>('.react-flow__viewport')
  const nodes = instance.getNodes()
  if (!viewport || !nodes.length) throw new Error('There is no graph to export.')

  const bounds = instance.getNodesBounds(nodes)
  const padding = 120
  const width = Math.ceil(bounds.width + padding * 2)
  const height = Math.ceil(bounds.height + padding * 2)
  const options = {
    backgroundColor: theme === 'dark' ? '#090a0f' : '#f5f7fb',
    width,
    height,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate(${padding - bounds.x}px, ${padding - bounds.y}px) scale(1)`,
    },
  }

  let blob: Blob | null
  if (format === 'png') {
    blob = await toBlob(viewport, { ...options, pixelRatio: 2 })
  } else {
    // Inset the SVG foreignObject itself; some viewers ignore CSS transforms on XHTML roots.
    const dataUrl = await toSvg(viewport, {
      ...options,
      style: { ...options.style, transform: `translate(${-bounds.x}px, ${-bounds.y}px) scale(1)` },
    })
    const svg = decodeURIComponent(dataUrl.slice(dataUrl.indexOf(',') + 1))
    const insetSvg = svg.replace(/<foreignObject\b[^>]*>/, (tag) =>
      `<rect width="100%" height="100%" fill="${options.backgroundColor}"/>${tag.replace(/\bx="0"/, `x="${padding}"`).replace(/\by="0"/, `y="${padding}"`)}`)
    if (insetSvg === svg) throw new Error('Could not create the SVG image.')
    blob = new Blob([insetSvg], { type: 'image/svg+xml;charset=utf-8' })
  }
  if (!blob) throw new Error('Could not create the image.')

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `graphen-architecture.${format}`
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
