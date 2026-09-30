import { Component, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { STAGE_COLORS, STAGES } from '../constants.js'

// One glowing sphere per pipeline stage, orbiting a wireframe core
function Orbit() {
  const group = useRef()

  useFrame((_, delta) => {
    group.current.rotation.y += delta * 0.35
    group.current.rotation.x += delta * 0.06
  })

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[1.25, 1]} />
        <meshBasicMaterial color="#334155" wireframe />
      </mesh>

      {STAGES.map((stage, i) => {
        const angle = (i / STAGES.length) * Math.PI * 2
        const color = STAGE_COLORS[stage]
        return (
          <mesh
            key={stage}
            position={[Math.cos(angle) * 2.5, Math.sin(angle * 2) * 0.7, Math.sin(angle) * 2.5]}
          >
            <sphereGeometry args={[0.34, 32, 32]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} />
          </mesh>
        )
      })}

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.015, 16, 120]} />
        <meshBasicMaterial color="#64748b" />
      </mesh>
    </group>
  )
}

// If the browser cannot run WebGL, show nothing instead of crashing the page
class Safe extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export default function Hero3D() {
  return (
    <Safe>
      <Canvas camera={{ position: [0, 1.2, 6.8], fov: 50 }} dpr={[1, 2]}>
        <ambientLight intensity={0.7} />
        <pointLight position={[6, 6, 6]} intensity={90} />
        <Orbit />
      </Canvas>
    </Safe>
  )
}
