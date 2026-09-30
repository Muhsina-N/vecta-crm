import { STAGE_COLORS } from '../constants.js'

export default function StageBadge({ stage }) {
  const color = STAGE_COLORS[stage] || '#94a3b8'
  return (
    <span className="badge" style={{ color, borderColor: color }}>
      {stage}
    </span>
  )
}
