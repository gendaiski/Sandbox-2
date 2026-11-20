import LZString from 'lz-string'
import { parseAal } from './parser/aalParser'

const MAX_LINK_LENGTH = 8000
const PREFIX = '#aal=v1.'

export function createShareLink(source: string, studioUrl: string): string {
  parseAal(source)
  const url = new URL(studioUrl)
  url.hash = `${PREFIX.slice(1)}${LZString.compressToEncodedURIComponent(source)}`
  const link = url.toString()
  if (link.length > MAX_LINK_LENGTH) {
    throw new Error('Architecture is too large for a share link. Download the YAML instead.')
  }
  return link
}

export function readShareLink(hash: string): { source?: string; error?: string } {
  if (!hash.startsWith('#aal=')) return {}
  if (!hash.startsWith(PREFIX) || hash.length > MAX_LINK_LENGTH) {
    return { error: 'Invalid architecture link. Your local YAML was preserved.' }
  }
  try {
    const source = LZString.decompressFromEncodedURIComponent(hash.slice(PREFIX.length))
    if (!source) throw new Error('Empty or malformed link')
    parseAal(source)
    return { source }
  } catch {
    return { error: 'Invalid architecture link. Your local YAML was preserved.' }
  }
}
