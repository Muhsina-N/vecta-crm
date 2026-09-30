import { Component, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'

// Animated rising bars, representing sales growth, for the dashboard header.
// Heights are randomised once per mount so it looks a little different each visit.
function Bars() {
  const group = useRef()
  const heights = useMemo(() => Array.from({ length: 12 }, () => 0.6 + Math.random() * 2.6), [])
  const colors = ['#2563eb', '#0ea5e9', '#10b981', '#8b5cf6']

  useFrame((state) => {
    group.current.children.forEach((bar, i) => {
      const target = heights[i]
      const wobble = Math.sin(state.clock.elapsedTime * 1.2 + i) * 0.08
      bar.scale.y += ((target + wobble) - bar.scale.y) * 0.06
      bar.position.y = (bar.scale.y - 1) / 2
    })
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.25
  })

  return (
    <group ref={group}>
      {heights.map((h, i) => (
        <mesh key={i} position={[(i - heights.length / 2) * 0.7, 0, 0]} scale={[1, 0.05, 1]}>
          <boxGeometry args={[0.42, 1, 0.42]} />
          <meshStandardMaterial color={colors[i % colors.length]} emissive={colors[i % colors.length]} emissiveIntensity={0.12} />
        </mesh>
      ))}
    </group>
  )
}

class Safe extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? null : this.props.children }
}

export default function DashboardHero3D() {
  return (
    <Safe>
      <Canvas camera={{ position: [0, 1.6, 7], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.7} />
        <pointLight position={[5, 6, 5]} intensity={80} />
        <Bars />
      </Canvas>
    </Safe>
  )
}
