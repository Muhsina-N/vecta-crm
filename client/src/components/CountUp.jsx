import { useEffect, useState } from 'react'
import { animate } from 'framer-motion'

// Number that counts up from 0 when it appears
export default function CountUp({ value, format = (n) => n.toLocaleString('en-US') }) {
  const [n, setN] = useState(0)

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.1,
      ease: 'easeOut',
      onUpdate: (v) => setN(v),
    })
    return () => controls.stop()
  }, [value])

  return <span>{format(Math.round(n))}</span>
}
