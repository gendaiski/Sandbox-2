import { useEffect, useState } from 'react'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Field,
  FieldDescription,
  FieldLabel,
  Input,
  Progress,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@nanisoft/prism-ui/components'
import { PACKS, type PackId, themeAttributes } from '@nanisoft/prism-ui/theming'

export interface Clause {
  id: string
  title: string
  risk: 'low' | 'medium' | 'high'
}

export const CLAUSES: Clause[] = [
  { id: '4', title: 'Confidentiality', risk: 'low' },
  { id: '5', title: 'Limitation of Liability', risk: 'high' },
  { id: '6.2', title: 'Termination for Cause', risk: 'medium' },
]

const RISK_BADGE = { low: 'success', medium: 'warning', high: 'destructive' } as const

/** A small contract-review console that exercises a spread of Prism components. */
export function App({ initialDark = false }: { initialDark?: boolean }) {
  const [pack, setPack] = useState<PackId>('default')
  const [dark, setDark] = useState(initialDark)
  const [query, setQuery] = useState('')
  const [approved, setApproved] = useState<string[]>([])

  const visible = CLAUSES.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()))
  const attrs = themeAttributes({ pack, mode: dark ? 'dark' : 'light' })

  // Mirror the theme onto <html> too, so the page background follows it.
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', dark)
    if (pack === 'default') root.removeAttribute('data-pack')
    else root.setAttribute('data-pack', pack)
  }, [pack, dark])

  return (
    <div {...attrs} data-testid="theme-root" style={{ padding: 24, maxWidth: 880, margin: '0 auto' }}>
      <Card>
        <CardHeader>
          <CardTitle>Contract review</CardTitle>
          <CardDescription>Master Services Agreement - Northwind / Contoso</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="clauses">
            <TabsList>
              <TabsTrigger value="clauses">Clauses</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="clauses">
              <Field>
                <FieldLabel htmlFor="clause-filter">Filter clauses</FieldLabel>
                <Input
                  id="clause-filter"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. liability"
                />
                <FieldDescription>{visible.length} of {CLAUSES.length} clauses</FieldDescription>
              </Field>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section</TableHead>
                    <TableHead>Clause</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.id}</TableCell>
                      <TableCell>{c.title}</TableCell>
                      <TableCell>
                        <Badge variant={RISK_BADGE[c.risk]}>{c.risk}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={approved.includes(c.id) ? 'secondary' : 'default'}
                          onClick={() => setApproved((a) => (a.includes(c.id) ? a : [...a, c.id]))}
                        >
                          {approved.includes(c.id) ? 'Approved' : `Approve ${c.title}`}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {visible.some((c) => c.risk === 'high' && !approved.includes(c.id)) && (
                <Alert variant="destructive">
                  <AlertTitle>High-risk clause pending</AlertTitle>
                  <AlertDescription>Review the liability cap before sign-off.</AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="settings">
              <Field>
                <FieldLabel htmlFor="pack">Theme pack</FieldLabel>
                <select id="pack" value={pack} onChange={(e) => setPack(e.target.value as PackId)}>
                  {PACKS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </Field>
              <Field>
                <FieldLabel htmlFor="dark-mode">Dark mode</FieldLabel>
                <Switch id="dark-mode" checked={dark} onCheckedChange={setDark} />
              </Field>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Progress
            value={Math.round((approved.length / CLAUSES.length) * 100)}
            aria-label="Review progress"
          />
        </CardFooter>
      </Card>
    </div>
  )
}
