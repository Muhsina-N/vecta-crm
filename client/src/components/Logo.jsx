// Vecta CRM logo: a rounded square with a bold "V" and an upward arrow tip
export default function Logo({ size = 34 }) {
  return (
    <svg className="brand-logo" width={size} height={size} viewBox="0 0 40 40" role="img" aria-label="Vecta CRM logo">
      <defs>
        <linearGradient id="vecta-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2563eb" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#vecta-g)" />
      <path d="M10 12 L20 29 L30 12" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M26 10 H32 V16" fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
