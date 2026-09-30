// A colourful initials avatar (customer, contact or employee).
// No network image is used, so it always renders, even offline or in a
// screen recording — the colour is generated from the name so it stays
// consistent for the same person every time.
const PALETTE = ['#f0b36b', '#60a5fa', '#a78bfa', '#34d399', '#f87171', '#38bdf8', '#fb923c', '#c084fc']

function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase()
}

export default function Avatar({ name, size = 40 }) {
  const color = PALETTE[hash(name || '?') % PALETTE.length]
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.4, background: color }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}
