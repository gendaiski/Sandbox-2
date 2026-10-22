import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Badge, Button } from '@nanisoft/prism-ui/components'
import { catalog } from '@nanisoft/prism-ui/catalog'
import { PACKS, themeAttributes } from '@nanisoft/prism-ui/theming'
import { App, CLAUSES } from './App'

describe('Prism components in isolation', () => {
  it('Button defaults to type="button" so it never submits a form by accident', () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'button')
  })

  it('Button keeps an explicit type="submit"', () => {
    render(<Button type="submit">Send</Button>)
    expect(screen.getByRole('button', { name: 'Send' })).toHaveAttribute('type', 'submit')
  })

  it('Button variants produce different classes', () => {
    render(
      <>
        <Button>Default</Button>
        <Button variant="destructive">Danger</Button>
      </>,
    )
    const a = screen.getByRole('button', { name: 'Default' }).className
    const b = screen.getByRole('button', { name: 'Danger' }).className
    expect(a).not.toEqual(b)
  })

  it('Badge renders as a span', () => {
    render(<Badge variant="success">ok</Badge>)
    expect(screen.getByText('ok').tagName).toBe('SPAN')
  })
})

describe('theming', () => {
  it('exposes the eight packs', () => {
    expect(PACKS).toContain('default')
    expect(PACKS.length).toBe(8)
  })

  it('themeAttributes maps pack to data-pack and dark mode to the dark class', () => {
    expect(themeAttributes({ pack: 'mint', mode: 'dark' })).toEqual({ 'data-pack': 'mint', className: 'dark' })
  })

  it('the default pack in light mode is the absence of attributes', () => {
    expect(themeAttributes({ pack: 'default', mode: 'light' })).toEqual({})
  })
})

describe('catalog', () => {
  it('lists the components this harness uses', () => {
    const slugs = new Set(catalog.map((item) => item.slug))
    for (const slug of ['button', 'badge', 'card', 'tabs', 'table']) {
      expect(slugs.has(slug), `catalog has ${slug}`).toBe(true)
    }
  })
})

describe('contract review console (App)', () => {
  it('renders every clause with a risk badge and a high-risk alert', () => {
    render(<App />)
    for (const c of CLAUSES) expect(screen.getByText(c.title)).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('High-risk clause pending')
  })

  it('filters clauses from the input', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('Filter clauses'), 'liab')
    expect(screen.getByText('Limitation of Liability')).toBeInTheDocument()
    expect(screen.queryByText('Confidentiality')).not.toBeInTheDocument()
    expect(screen.getByText('1 of 3 clauses')).toBeInTheDocument()
  })

  it('approving the high-risk clause clears the alert and moves progress', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Approve Limitation of Liability' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Review progress' })).toHaveAttribute('aria-valuenow', '33')
  })

  it('switching tabs shows settings, and the switch turns on dark mode', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('tab', { name: 'Settings' }))
    const toggle = screen.getByRole('switch')
    expect(toggle).not.toBeChecked()
    expect(screen.getByTestId('theme-root')).not.toHaveClass('dark')
    await user.click(toggle)
    expect(toggle).toBeChecked()
    expect(screen.getByTestId('theme-root')).toHaveClass('dark')
  })

  it('changing the pack updates the theme root', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('tab', { name: 'Settings' }))
    await user.selectOptions(screen.getByLabelText('Theme pack'), 'lavender')
    expect(screen.getByTestId('theme-root')).toHaveAttribute('data-pack', 'lavender')
  })

  it('table has a header row and one row per clause', () => {
    render(<App />)
    const rows = within(screen.getByRole('table')).getAllByRole('row')
    expect(rows.length).toBe(CLAUSES.length + 1)
  })
})
