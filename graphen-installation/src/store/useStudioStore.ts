import { create } from 'zustand'
import sampleSource from '../assets/sample.aal.yaml?raw'
import { readShareLink } from '../core/shareLink'
import type { LayoutDirection } from '../core/types/graph'

type Theme = 'dark' | 'light'

type StudioState = {
  theme: Theme
  layoutDirection: LayoutDirection
  source: string
  sharedLayoutScope: string | null
  shareError: string | null
  editorVisible: boolean
  toggleTheme: () => void
  setLayoutDirection: (direction: LayoutDirection) => void
  setSource: (source: string) => void
  toggleEditor: () => void
}

const storedTheme = localStorage.getItem('graphen-theme')
const initialTheme: Theme = storedTheme === 'light' ? 'light' : 'dark'
document.documentElement.dataset.theme = initialTheme
const storedDirection = localStorage.getItem('graphen-layout-direction')
const initialDirection: LayoutDirection = storedDirection === 'RL' || storedDirection === 'TB' || storedDirection === 'BT'
  ? storedDirection : 'LR'
const storedEditorVisible = localStorage.getItem('graphen-editor-visible')
const initialEditorVisible = storedEditorVisible !== 'false'
const shared = readShareLink(window.location.hash)
if (shared.source) {
  localStorage.setItem('graphen-source', shared.source)
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
}

export const useStudioStore = create<StudioState>((set) => ({
  theme: initialTheme,
  layoutDirection: initialDirection,
  source: shared.source ?? localStorage.getItem('graphen-source') ?? sampleSource,
  sharedLayoutScope: shared.source ? crypto.randomUUID() : null,
  shareError: shared.error ?? null,
  editorVisible: initialEditorVisible,
  setSource: (source) => {
    localStorage.setItem('graphen-source', source)
    set({ source })
  },
  setLayoutDirection: (direction) => {
    localStorage.setItem('graphen-layout-direction', direction)
    set({ layoutDirection: direction })
  },
  toggleEditor: () =>
    set((state) => {
      const editorVisible = !state.editorVisible
      localStorage.setItem('graphen-editor-visible', String(editorVisible))
      return { editorVisible }
    }),
  toggleTheme: () =>
    set((state) => {
      const theme = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('graphen-theme', theme)
      document.documentElement.dataset.theme = theme
      return { theme }
    }),
}))
