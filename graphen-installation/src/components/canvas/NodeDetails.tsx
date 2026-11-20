import type { Node } from '@xyflow/react'
import { X } from 'lucide-react'

type Props = {
  node: Node
  onClose: () => void
}

function formatValue(value: unknown): string {
  if (value == null) return '—'
  if (typeof value === 'string') return value || '—'
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.map(formatValue).join(', ') || '—'
  return JSON.stringify(value, null, 2)
}

function fieldLabel(key: string) {
  return key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ')
}

function DetailValue({ value }: { value: unknown }) {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return (
      <dl className="details-object">
        {Object.entries(value).map(([key, entry]) => (
          <div key={key}>
            <dt>{fieldLabel(key)}</dt>
            <dd>{formatValue(entry)}</dd>
          </div>
        ))}
      </dl>
    )
  }

  return <>{formatValue(value)}</>
}

export function NodeDetails({ node, onClose }: Props) {
  const title = typeof node.data.label === 'string' ? node.data.label : node.id
  const metadata = Object.entries(node.data).filter(([key]) => key !== 'label')

  return (
    <aside className="node-details" aria-label={`Details for ${title}`}>
      <div className="details-header">
        <div>
          <span className="details-eyebrow">Component details</span>
          <h2>{title}</h2>
          {node.type && <span className={`details-type details-type-${node.type}`}>{node.type}</span>}
        </div>
        <button className="details-close" type="button" onClick={onClose} aria-label="Close details">
          <X size={18} />
        </button>
      </div>
      <div className="details-content">
        {metadata.length ? (
          <dl className="details-list">
            {metadata.map(([key, value]) => (
              <div className="details-field" key={key}>
                <dt>{fieldLabel(key)}</dt>
                <dd><DetailValue value={value} /></dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="details-empty">No additional metadata for this component.</p>
        )}
      </div>
    </aside>
  )
}
