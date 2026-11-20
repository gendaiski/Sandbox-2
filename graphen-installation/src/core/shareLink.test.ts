import { describe, expect, it } from 'vitest'
import LZString from 'lz-string'
import sampleSource from '../assets/sample.aal.yaml?raw'
import { createShareLink, readShareLink } from './shareLink'

describe('architecture share links', () => {
  it('round-trips YAML with Unicode and preserves the studio path', () => {
    const source = sampleSource.replace('Support Orchestrator', 'Orquestração 🚀')
    const link = createShareLink(source, 'https://example.com/graphen/studio/')
    const url = new URL(link)

    expect(url.pathname).toBe('/graphen/studio/')
    expect(url.hash).toMatch(/^#aal=v1\./)
    expect(readShareLink(url.hash)).toEqual({ source })
  })

  it('rejects malformed and invalid AAL links without returning a source', () => {
    expect(readShareLink('#aal=v2.anything').error).toBeTruthy()
    expect(readShareLink('#aal=v1.invalid').error).toBeTruthy()
    expect(readShareLink(`#aal=v1.${LZString.compressToEncodedURIComponent('metadata: [')}`).error).toBeTruthy()
    expect(readShareLink('#other=hello')).toEqual({})
    expect(() => createShareLink('metadata: [', 'https://example.com/graphen/studio/')).toThrow()
  })

  it('refuses links too long to share reliably', () => {
    const longSource = sampleSource.replace('Support Orchestrator', Array.from({ length: 6000 }, (_, i) => i.toString(36)).join('-'))
    expect(() => createShareLink(longSource, 'https://example.com/graphen/studio/')).toThrow(/too large/)
  })
})
