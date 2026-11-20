import { useEffect, useRef, useState } from 'react'
import Editor, { loader, type BeforeMount, type OnMount } from '@monaco-editor/react'
import { Check, ChevronDown, ChevronUp, Copy, Download, FileCode2, Share2 } from 'lucide-react'
import * as monaco from 'monaco-editor/editor/editor.api'
import type { editor } from 'monaco-editor'
import EditorWorker from 'monaco-editor/editor/editor.worker.js?worker'
import type { AalParseError } from '../../core/parser/aalParser'
import { createShareLink } from '../../core/shareLink'
import { useStudioStore } from '../../store/useStudioStore'

import sampleSource from '../../assets/sample.aal.yaml?raw'
import simpleSource from '../../assets/simple-agent.aal.yaml?raw'
import ragSource from '../../assets/rag-pipeline.aal.yaml?raw'
import securitySource from '../../assets/security-gates.aal.yaml?raw'

(self as typeof self & { MonacoEnvironment: { getWorker: () => Worker } }).MonacoEnvironment = {
  getWorker: () => new EditorWorker(),
}
loader.config({ monaco })

const configureEditor: BeforeMount = (api) => {
  if (!api.languages.getLanguages().some((language: { id: string }) => language.id === 'aal-yaml')) {
    api.languages.register({ id: 'aal-yaml' })
    api.languages.setLanguageConfiguration('aal-yaml', {
      comments: { lineComment: '#' },
      brackets: [['[', ']'], ['{', '}']],
    })
    api.languages.setMonarchTokensProvider('aal-yaml', {
      tokenizer: {
        root: [
          [/\s*#.*/, 'comment'],
          [/[\w-]+(?=\s*:)/, 'key'],
          [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/, 'string'],
          [/\b(?:true|false|null)\b/, 'keyword'],
          [/\b\d+(?:\.\d+)?\b/, 'number'],
        ],
      },
    })
  }

  api.editor.defineTheme('graphen-dark', {
    base: 'vs-dark', inherit: true,
    rules: [
      { token: 'key', foreground: '7dd3fc' },
      { token: 'string', foreground: 'a7f3d0' },
      { token: 'number', foreground: 'fbbf24' },
      { token: 'keyword', foreground: 'c4b5fd' },
      { token: 'comment', foreground: '778397' },
    ],
    colors: {
      'editor.background': '#12141c',
      'editor.foreground': '#f3f4f6',
      'editorGutter.background': '#12141c',
      'editorLineNumber.foreground': '#69758a',
      'editorCursor.foreground': '#60a5fa',
    },
  })
  api.editor.defineTheme('graphen-light', {
    base: 'vs', inherit: true,
    rules: [
      { token: 'key', foreground: '1d4ed8' },
      { token: 'string', foreground: '047857' },
      { token: 'number', foreground: 'b45309' },
      { token: 'keyword', foreground: '7c3aed' },
      { token: 'comment', foreground: '778397' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#171d2b',
      'editorGutter.background': '#ffffff',
      'editorLineNumber.foreground': '#8490a3',
      'editorCursor.foreground': '#2563eb',
    },
  })
}

type Props = { error: AalParseError | null; shareDisabled: boolean; onReady: () => void }

function applyDiagnostics(
  instance: editor.IStandaloneCodeEditor,
  decorations: editor.IEditorDecorationsCollection,
  error: AalParseError | null,
) {
  const model = instance.getModel()
  if (!model) return

  const location = error?.location
  monaco.editor.setModelMarkers(model, 'aal', location ? [{
    startLineNumber: location.line,
    startColumn: location.column,
    endLineNumber: location.line,
    endColumn: location.column + 1,
    message: error.issues[0],
    severity: monaco.MarkerSeverity.Error,
  }] : [])
  decorations.set(location ? [{
    range: new monaco.Range(location.line, 1, location.line, 1),
    options: {
      isWholeLine: true,
      glyphMarginClassName: 'aal-error-glyph',
      glyphMarginHoverMessage: { value: error.issues[0] },
    },
  }] : [])
}

const examples = [
  { id: 'sample', label: 'Support Orchestrator', description: 'Multi-agent support flow', source: sampleSource },
  { id: 'simple', label: 'Simple Agent', description: 'Single agent with two tools', source: simpleSource },
  { id: 'rag', label: 'RAG Pipeline', description: 'Retrieval augmented generation', source: ragSource },
  { id: 'security', label: 'Security Gates', description: 'Approval gates and guardrails', source: securitySource },
] as const

export default function EditorPanel({ error, shareDisabled, onReady }: Props) {
  const source = useStudioStore((state) => state.source)
  const setSource = useStudioStore((state) => state.setSource)
  const theme = useStudioStore((state) => state.theme)
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const decorationsRef = useRef<editor.IEditorDecorationsCollection | null>(null)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')
  const [shareFeedback, setShareFeedback] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const copyTimeout = useRef<number | undefined>(undefined)

  const activeId = examples.find((example) => example.source === source)?.id

  useEffect(() => () => window.clearTimeout(copyTimeout.current), [])

  useEffect(() => {
    if (!menuOpen) return
    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  function loadExample(exampleSource: string) {
    setSource(exampleSource)
    setCopyState('idle')
    setShareFeedback(null)
    setMenuOpen(false)
  }

  async function copyYaml() {
    window.clearTimeout(copyTimeout.current)
    try {
      await navigator.clipboard.writeText(source)
      setCopyState('copied')
    } catch {
      setCopyState('error')
    }
    copyTimeout.current = window.setTimeout(() => setCopyState('idle'), 2000)
  }

  async function shareYaml() {
    window.clearTimeout(copyTimeout.current)
    try {
      const link = createShareLink(source, window.location.href)
      await navigator.clipboard.writeText(link)
      setShareFeedback('Link copied')
    } catch (error) {
      setShareFeedback(error instanceof Error && error.message.includes('too large')
        ? 'Link too long — download YAML.' : 'Could not copy the share link.')
    }
    copyTimeout.current = window.setTimeout(() => setShareFeedback(null), 5000)
  }

  function downloadYaml() {
    const metadata = error ? null : source.match(/metadata:\s*\n\s*name:\s*"?([^\n"]+)"?/)
    const name = metadata?.[1]?.trim().replace(/[^a-z0-9_-]/gi, '-') || 'architecture'
    const blob = new Blob([source], { type: 'text/yaml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${name}.aal.yaml`
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const onMount: OnMount = (instance) => {
    editorRef.current = instance
    decorationsRef.current = instance.createDecorationsCollection()
    applyDiagnostics(instance, decorationsRef.current, error)
    onReady()
  }

  useEffect(() => {
    const instance = editorRef.current
    const decorations = decorationsRef.current
    if (instance && decorations) applyDiagnostics(instance, decorations, error)
  }, [error])

  return (
    <section className="editor-panel" id="graphen-editor" aria-label="Code editor">
      <div className="panel-heading editor-heading">
        <FileCode2 size={17} />
        <span>architecture.aal.yaml</span>
        <span className={`editor-status${error ? ' is-error' : ''}`}>{error ? 'Invalid AAL' : 'Saved locally'}</span>
        <span className="copy-feedback" aria-live="polite">
          {shareFeedback ?? (copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Copy failed' : '')}
        </span>
        <button
          className="editor-copy-button"
          type="button"
          disabled={shareDisabled}
          onClick={() => void shareYaml()}
          aria-label="Copy architecture share link"
          title={shareDisabled ? 'Fix YAML errors before sharing' : 'Copy share link'}
        >
          <Share2 size={15} />
        </button>
        <button
          className="editor-copy-button"
          type="button"
          onClick={() => void copyYaml()}
          aria-label="Copy YAML to clipboard"
          title="Copy YAML"
        >
          {copyState === 'copied' ? <Check size={15} /> : <Copy size={15} />}
        </button>
        <button
          className="editor-copy-button"
          type="button"
          onClick={() => void downloadYaml()}
          aria-label="Download YAML file"
          title="Download YAML"
        >
          <Download size={15} />
        </button>
        <div className="example-picker" ref={menuRef}>
          <button
            className="editor-copy-button"
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Load example architecture"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            title="Examples"
          >
            {menuOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
          {menuOpen && (
            <div className="example-menu" role="menu">
              <div className="example-menu-label">Examples</div>
              {examples.map(({ id, label, description }) => (
                <button
                  key={id}
                  className={`example-menu-item${id === activeId ? ' is-active' : ''}`}
                  type="button"
                  role="menuitem"
                  onClick={() => loadExample(examples.find((item) => item.id === id)!.source)}
                >
                  <span className="example-menu-name">
                    {label}
                    {id === activeId && <Check size={14} />}
                  </span>
                  <span className="example-menu-description">{description}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="editor-body">
        <Editor
          language="aal-yaml"
          theme={`graphen-${theme}`}
          value={source}
          onChange={(value) => {
            setCopyState('idle')
            setShareFeedback(null)
            setSource(value ?? '')
          }}
          beforeMount={configureEditor}
          onMount={onMount}
          loading={<span className="editor-loading">Loading editor…</span>}
          options={{
            minimap: { enabled: false },
            glyphMargin: true,
            fontSize: 13,
            lineHeight: 21,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 14, bottom: 14 },
          }}
        />
      </div>
      {error && (
        <div className="editor-diagnostics" role="alert">
          {error.issues.map((issue, index) => <div key={`${index}-${issue}`}>{issue}</div>)}
        </div>
      )}
    </section>
  )
}
