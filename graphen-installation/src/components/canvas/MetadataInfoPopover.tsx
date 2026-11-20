import { useEffect, useRef, useState } from 'react'
import { Building2, Clock, Info, User, X } from 'lucide-react'
import type { AalMetadata } from '../../core/types/aal.schema'

type Props = {
  metadata: AalMetadata
}

export function MetadataInfoPopover({ metadata }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    function handleClickOutside(event: Event) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handleClickOutside, true)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handleClickOutside, true)
    }
  }, [isOpen])

  const hasExtraFields = Boolean(
    metadata.description || metadata.owner || metadata.cost_center || metadata.sla
  )

  return (
    <div className="metadata-info-wrapper" ref={containerRef}>
      <button
        type="button"
        className={`metadata-info-trigger ${isOpen ? 'is-active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="View architecture metadata"
        aria-expanded={isOpen}
        title="Architecture metadata"
      >
        <Info size={15} aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="metadata-popover" role="dialog" aria-label="Architecture metadata">
          <div className="metadata-popover-header">
            <h3 className="metadata-popover-title">{metadata.name}</h3>
            <button
              type="button"
              className="metadata-popover-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close metadata popover"
            >
              <X size={15} aria-hidden="true" />
            </button>
          </div>

          <div className="metadata-popover-content">
            {metadata.description && (
              <p className="metadata-popover-description">{metadata.description}</p>
            )}

            <div className="metadata-popover-fields">
              {metadata.owner && (
                <div className="metadata-field">
                  <span className="metadata-field-label">
                    <User size={13} aria-hidden="true" /> Owner
                  </span>
                  <span className="metadata-field-value">{metadata.owner}</span>
                </div>
              )}

              {metadata.cost_center && (
                <div className="metadata-field">
                  <span className="metadata-field-label">
                    <Building2 size={13} aria-hidden="true" /> Cost Center
                  </span>
                  <span className="metadata-field-value">{metadata.cost_center}</span>
                </div>
              )}

              {metadata.sla && (
                <div className="metadata-field">
                  <span className="metadata-field-label">
                    <Clock size={13} aria-hidden="true" /> SLA
                  </span>
                  <span className="metadata-field-value">{metadata.sla}</span>
                </div>
              )}
            </div>

            {!hasExtraFields && (
              <p className="metadata-popover-empty">
                No additional metadata (description, owner, cost center, or SLA) specified.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
