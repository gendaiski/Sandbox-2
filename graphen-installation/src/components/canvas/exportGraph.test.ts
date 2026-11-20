import type { ReactFlowInstance } from '@xyflow/react'
import { toBlob, toSvg } from 'html-to-image'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { exportGraph } from './exportGraph'

vi.mock('html-to-image', () => ({
  toBlob: vi.fn(async () => new Blob(['png'], { type: 'image/png' })),
  toSvg: vi.fn(async () => 'data:image/svg+xml,%3Csvg%3E%3CforeignObject%20x%3D%220%22%20y%3D%220%22%2F%3E%3C%2Fsvg%3E'),
}))

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

describe('exportGraph', () => {
  it.each(['png', 'svg'] as const)('exports the whole graph as %s, independently of the viewport', async (format) => {
    const viewport = {} as HTMLElement
    const link = { href: '', download: '', click: vi.fn(), remove: vi.fn() }
    vi.stubGlobal('document', {
      createElement: () => link,
      body: { append: vi.fn() },
    })
    vi.stubGlobal('window', { setTimeout: vi.fn() })
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:graph')

    const container = { querySelector: () => viewport } as unknown as HTMLElement
    const instance = {
      getNodes: () => [{ id: 'agent' }],
      getNodesBounds: () => ({ x: 200, y: 100, width: 800, height: 400 }),
    } as unknown as ReactFlowInstance

    await exportGraph(instance, container, format, 'dark')

    const imageFunction = format === 'png' ? toBlob : toSvg
    expect(imageFunction).toHaveBeenCalledWith(viewport, expect.objectContaining({
      width: 1040,
      height: 640,
      backgroundColor: '#090a0f',
      style: expect.objectContaining({
        transform: format === 'png'
          ? 'translate(-80px, 20px) scale(1)'
          : 'translate(-200px, -100px) scale(1)',
      }),
      ...(format === 'png' && { pixelRatio: 2 }),
    }))
    expect(link.download).toBe(`graphen-architecture.${format}`)
    expect(link.click).toHaveBeenCalledOnce()
    if (format === 'svg') {
      const blob = createObjectURL.mock.calls[0][0]
      expect(blob).toBeInstanceOf(Blob)
      expect(await (blob as Blob).text()).toContain('<rect width="100%" height="100%" fill="#090a0f"/><foreignObject x="120" y="120"/>')
    }
  })
})
