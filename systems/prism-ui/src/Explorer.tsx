import { useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@nanisoft/prism-ui/components'
import { Kanban01, RecordDetail01, Stats01, type KanbanCard, type KanbanColumn, type KanbanState } from '@nanisoft/prism-ui/blocks'
import { catalog } from '@nanisoft/prism-ui/catalog'
import { PACKS, type PackId, themeAttributes } from '@nanisoft/prism-ui/theming'
import { App } from './App'

const KINDS = ['all', 'component', 'block', 'page', 'live'] as const

type Card = KanbanCard & { column: string }
const START: Card[] = [
  { id: 'c1', column: 'intake', title: 'Vendor MSA: Fabrikam Cloud', owner: 'Maria', state: 'ready', stateLabel: 'Ready', tags: [{ id: 't1', label: 'MSA' }] },
  { id: 'c2', column: 'review', title: 'DPA: Tailspin Search', owner: 'Sam', state: 'active', stateLabel: 'In review', tags: [{ id: 't2', label: 'Privacy' }] },
  { id: 'c3', column: 'review', title: 'NDA: Litware Mail', owner: 'Dev', state: 'blocked', stateLabel: 'Blocked', tags: [{ id: 't3', label: 'NDA' }] },
  { id: 'c4', column: 'signed', title: 'Order form: Contoso renewal', owner: 'Priya', state: 'done', stateLabel: 'Signed', tags: [{ id: 't4', label: 'Renewal' }] },
]
const COLUMNS = [
  { id: 'intake', label: 'Intake' },
  { id: 'review', label: 'In review', limit: 3 },
  { id: 'signed', label: 'Signed' },
]
const NEXT_STATE: Record<string, [KanbanState, string]> = { intake: ['ready', 'Ready'], review: ['active', 'In review'], signed: ['done', 'Signed'] }

/** A tour of Prism: its checked catalogue, live blocks, theme packs and a small app. */
export function Explorer({ initialDark = false }: { initialDark?: boolean }) {
  const [pack, setPack] = useState<PackId>('default')
  const [dark, setDark] = useState(initialDark)
  const [kind, setKind] = useState<(typeof KINDS)[number]>('all')
  const [query, setQuery] = useState('')
  const [cards, setCards] = useState(START)
  const attrs = themeAttributes({ pack, mode: dark ? 'dark' : 'light' })

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', dark)
    for (const [k, v] of Object.entries(attrs)) root.setAttribute(k, String(v))
  }, [attrs, dark])

  const items = useMemo(
    () => catalog.filter((c) => (kind === 'all' || c.kind === kind) && `${c.name} ${c.description} ${c.category ?? ''}`.toLowerCase().includes(query.toLowerCase())),
    [kind, query],
  )
  const counts = useMemo(() => Object.fromEntries(KINDS.map((k) => [k, k === 'all' ? catalog.length : catalog.filter((c) => c.kind === k).length])), [])

  const columns: KanbanColumn[] = COLUMNS.map((col) => ({
    ...col,
    cards: cards.filter((c) => c.column === col.id).map(({ column, ...card }) => ({
      ...card,
      body: (
        <span style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          {COLUMNS.filter((x) => x.id !== column).map((x) => (
            <Button key={x.id} size="sm" variant="outline" onClick={() => setCards((cs) => cs.map((c) => (c.id === card.id ? { ...c, column: x.id, state: NEXT_STATE[x.id][0], stateLabel: NEXT_STATE[x.id][1] } : c)))}>
              Move to {x.label}
            </Button>
          ))}
        </span>
      ),
    })),
  }))

  return (
    <div {...attrs} style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--foreground)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '20px max(16px, env(safe-area-inset-left, 0px))', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Prism UI Explorer</h1>
          <span style={{ opacity: 0.7 }}>@nanisoft/prism-ui 1.2: the real components, blocks and themes</span>
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 14 }}>
              Pack
              <select value={pack} onChange={(e) => setPack(e.target.value as PackId)} aria-label="Theme pack" style={{ padding: '4px 8px', borderRadius: 6 }}>
                {PACKS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
            <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 14 }}>
              <Switch checked={dark} onCheckedChange={setDark} aria-label="Dark mode" /> Dark
            </label>
          </span>
        </header>

        <Tabs defaultValue="catalogue">
          <TabsList>
            <TabsTrigger value="catalogue">Catalogue ({catalog.length})</TabsTrigger>
            <TabsTrigger value="blocks">Live blocks</TabsTrigger>
            <TabsTrigger value="app">Contract console</TabsTrigger>
            <TabsTrigger value="themes">Theme packs</TabsTrigger>
          </TabsList>

          <TabsContent value="catalogue">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '12px 0' }}>
              <Input placeholder="Search components, blocks and pages" value={query} onChange={(e) => setQuery(e.target.value)} style={{ maxWidth: 320 }} aria-label="Search the catalogue" />
              {KINDS.map((k) => (
                <Button key={k} size="sm" variant={k === kind ? 'default' : 'outline'} onClick={() => setKind(k)}>
                  {k} ({counts[k]})
                </Button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {items.slice(0, 120).map((c) => (
                <Card key={c.slug}>
                  <CardHeader>
                    <CardTitle style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      {c.name} <Badge variant="secondary">{c.kind}</Badge>
                    </CardTitle>
                    <CardDescription>{c.category ?? c.source}</CardDescription>
                  </CardHeader>
                  <CardContent style={{ fontSize: 13 }}>{c.description}</CardContent>
                </Card>
              ))}
            </div>
            {items.length > 120 && <p style={{ opacity: 0.7, fontSize: 13 }}>Showing 120 of {items.length}; search to narrow.</p>}
          </TabsContent>

          <TabsContent value="blocks">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 12 }}>
              <Stats01
                eyebrow="Stats01"
                title="Contract portfolio this quarter"
                stats={[
                  { key: 'open', label: 'Open reviews', value: cards.filter((c) => c.column !== 'signed').length, delta: 12, series: [3, 4, 4, 5, 6, 5, cards.filter((c) => c.column !== 'signed').length], seriesLabel: 'Open reviews per week' },
                  { key: 'signed', label: 'Signed', value: cards.filter((c) => c.column === 'signed').length, delta: 4 },
                  { key: 'cycle', label: 'Median cycle time', value: '6.5 days', delta: -9 },
                ]}
              />
              <Kanban01 eyebrow="Kanban01" title="Review pipeline" description="Move a contract with its buttons; the stats above follow." columns={columns} />
              <RecordDetail01
                eyebrow="RecordDetail01"
                title="Master Services Agreement"
                description="Northwind Legal Technologies Ltd. and Contoso Holdings LLC"
                fields={[
                  { id: 'term', label: 'Initial term', value: '24 months, renewing yearly' },
                  { id: 'cap', label: 'Liability cap', value: 'Fees paid in the prior 12 months' },
                  { id: 'law', label: 'Governing law', value: 'State of New York' },
                  { id: 'sla', label: 'Uptime target', value: '99.5% monthly' },
                ]}
              />
            </div>
          </TabsContent>

          <TabsContent value="app">
            <div style={{ marginTop: 12 }}><App initialDark={dark} /></div>
          </TabsContent>

          <TabsContent value="themes">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginTop: 12 }}>
              {PACKS.map((p) => (
                <div key={p} {...themeAttributes({ pack: p, mode: dark ? 'dark' : 'light' })} className={dark ? 'dark' : undefined} style={{ background: 'var(--background)', color: 'var(--foreground)', borderRadius: 12, padding: 12, border: '1px solid var(--border)' }}>
                  <Card>
                    <CardHeader><CardTitle>{p}</CardTitle><CardDescription>Theme pack</CardDescription></CardHeader>
                    <CardContent style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <Button size="sm" onClick={() => setPack(p)}>Use {p}</Button>
                      <Badge>Badge</Badge><Badge variant="secondary">Muted</Badge>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
