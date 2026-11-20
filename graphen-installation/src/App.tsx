import { lazy, Suspense, useEffect, useState } from 'react'
import sampleSource from './assets/sample.aal.yaml?raw'
import { CanvasPanel } from './components/canvas/CanvasPanel'
import { TopBar } from './components/ui/TopBar'
import { AalParseError, parseAal } from './core/parser/aalParser'
import type { AalDocument } from './core/types/aal.schema'
import { useStudioStore } from './store/useStudioStore'

const sampleDocument = parseAal(sampleSource)
const EditorPanel = lazy(() => import('./components/editor/EditorPanel'))

type Draft = {
  document: AalDocument
  error: AalParseError | null
  validatedSource: string
  validSource: string
}

export default function App() {
  const source = useStudioStore((state) => state.source)
  const editorVisible = useStudioStore((state) => state.editorVisible)
  const shareError = useStudioStore((state) => state.shareError)
  const toggleEditor = useStudioStore((state) => state.toggleEditor)
  const [editorReady, setEditorReady] = useState(false)
  const [draft, setDraft] = useState<Draft>(() => {
    try {
      return { document: parseAal(source), error: null, validatedSource: source, validSource: source }
    } catch (error) {
      if (!(error instanceof AalParseError)) throw error
      const savedValidSource = localStorage.getItem('graphen-valid-source') ?? sampleSource
      let document = sampleDocument
      let validSource = sampleSource
      try {
        document = parseAal(savedValidSource)
        validSource = savedValidSource
      } catch (savedError) {
        if (!(savedError instanceof AalParseError)) throw savedError
      }
      return { document, error, validatedSource: source, validSource }
    }
  })

  useEffect(() => {
    localStorage.setItem('graphen-valid-source', draft.validSource)
  }, [draft.validSource])

  useEffect(() => {
    if (source === draft.validatedSource) return

    const timer = window.setTimeout(() => {
      try {
        setDraft({ document: parseAal(source), error: null, validatedSource: source, validSource: source })
      } catch (error) {
        if (!(error instanceof AalParseError)) throw error
        setDraft((current) => ({ ...current, error, validatedSource: source }))
      }
    }, 300)

    return () => window.clearTimeout(timer)
  }, [source, draft.validatedSource])

  const pending = source !== draft.validatedSource

  return (
    <div className="app-shell">
      <TopBar />
      {shareError && <div className="share-error" role="alert">{shareError}</div>}
      <main className={`workspace${editorVisible ? '' : ' editor-hidden'}`}>
        <Suspense fallback={<section className="editor-panel" id="graphen-editor" aria-label="Code editor"><div className="panel-heading">Editor</div><span className="editor-loading">Loading editor…</span></section>}>
          <EditorPanel error={pending ? null : draft.error} shareDisabled={pending || !!draft.error} onReady={() => setEditorReady(true)} />
        </Suspense>
        {editorReady ? (
          <CanvasPanel
            document={draft.document}
            status={pending ? 'Updating…' : draft.error ? 'Last valid version' : 'Up to date'}
            editorVisible={editorVisible}
            onToggleEditor={toggleEditor}
          />
        ) : (
          <section className="canvas-panel" aria-label="Architecture canvas" aria-busy="true">
            <div className="panel-heading">Architecture</div>
            <div className="canvas-loading">Preparing canvas…</div>
          </section>
        )}
      </main>
    </div>
  )
}
