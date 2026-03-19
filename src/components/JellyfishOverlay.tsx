import { useEffect, useState } from 'react'
import { Jellyfish } from '../hooks/useJellyfish'

interface JellyfishOverlayProps {
  jellies: Jellyfish[]
}

interface AnimatedJellyfishProps {
  jf: Jellyfish
}

function AnimatedJellyfish({ jf }: AnimatedJellyfishProps) {
  const [style, setStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    left: `${jf.x}vw`,
    top: `${jf.y}vh`,
    fontSize: `${jf.size}px`,
    opacity: 0,
    transition: 'none',
    pointerEvents: 'none',
    zIndex: 9999,
    filter: 'drop-shadow(0 0 8px rgba(159, 191, 255, 0.4))',
  })

  useEffect(() => {
    let currentX = jf.x
    let currentY = jf.y
    let segmentIndex = 0
    const timers: number[] = []

    // Fade in
    const fadeInTimer = window.setTimeout(() => {
      setStyle((prev) => ({
        ...prev,
        opacity: 0.85,
        transition: 'opacity 0.8s ease-in',
      }))
    }, 50)
    timers.push(fadeInTimer)

    // Start drifting after fade-in
    let elapsed = 800 // after fade-in

    for (const segment of jf.segments) {
      const targetX = currentX + segment.dx
      const targetY = currentY + segment.dy
      const dur = segment.duration

      const capturedX = targetX
      const capturedY = targetY
      const capturedDur = dur
      const isLast = segmentIndex === jf.segments.length - 1

      const timer = window.setTimeout(() => {
        setStyle((prev) => ({
          ...prev,
          left: `${capturedX}vw`,
          top: `${capturedY}vh`,
          opacity: isLast ? 0 : 0.85,
          transition: `left ${capturedDur}s ease-in-out, top ${capturedDur}s ease-in-out, opacity ${isLast ? capturedDur : 0.3}s ease-in-out`,
        }))
      }, elapsed)
      timers.push(timer)

      elapsed += dur * 1000
      currentX = targetX
      currentY = targetY
      segmentIndex++
    }

    return () => {
      timers.forEach((t) => clearTimeout(t))
    }
  }, [jf])

  // Gentle pulsing bob via CSS animation
  return (
    <div style={style}>
      <div
        style={{
          animation: `jellyBob ${1.5 + Math.random() * 1}s ease-in-out infinite alternate`,
        }}
      >
        🪼
      </div>
    </div>
  )
}

export default function JellyfishOverlay({ jellies }: JellyfishOverlayProps) {
  return (
    <>
      <style>{`
        @keyframes jellyBob {
          0% { transform: translateY(0px) rotate(-5deg); }
          100% { transform: translateY(-8px) rotate(5deg); }
        }
      `}</style>
      {jellies.map((jf) => (
        <AnimatedJellyfish key={jf.id} jf={jf} />
      ))}
    </>
  )
}
