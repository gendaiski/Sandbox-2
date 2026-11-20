import { Handle, Position } from '@xyflow/react'
import type { LucideIcon } from 'lucide-react'


type Props = {
  category: string
  label: string
  name: string
  icon: LucideIcon
  detail?: string
  badges?: string[]
}

export function NodeCard({ category, label, name, icon: Icon, detail, badges = [] }: Props) {
  return (
    <div className={`graph-card graph-card-${category}`}>
      <Handle id="top" type="source" position={Position.Top} />
      <Handle id="top-target" type="target" position={Position.Top} />
      <Handle id="right" type="source" position={Position.Right} />
      <Handle id="right-target" type="target" position={Position.Right} />
      <Handle id="bottom" type="source" position={Position.Bottom} />
      <Handle id="bottom-target" type="target" position={Position.Bottom} />
      <Handle id="left" type="source" position={Position.Left} />
      <Handle id="left-target" type="target" position={Position.Left} />
      <div className="graph-card-header">
        <span className="graph-card-icon"><Icon size={17} strokeWidth={1.8} /></span>
        <span className="graph-card-category">{label}</span>
      </div>
      <strong className="graph-card-name" title={name}>{name}</strong>
      {detail && <span className="graph-card-detail" title={detail}>{detail}</span>}
      {badges.length > 0 && (
        <div className="graph-card-badges">
          {badges.map((badge) => <span className="graph-card-badge" title={badge} key={badge}>{badge}</span>)}
        </div>
      )}
    </div>
  )
}

