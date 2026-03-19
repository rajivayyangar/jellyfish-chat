import { useEffect, useState } from 'react'
import { Creature, CREATURE_EMOJI } from '../hooks/useJellyfish'

interface Props {
  creatures: Creature[]
}

function AnimatedCreature({ c }: { c: Creature }) {
  const emoji = CREATURE_EMOJI[c.type] || '🪼'
  const totalDuration = c.segments.reduce((sum, s) => sum + s.duration, 0)

  const [style, setStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    left: `${c.x}vw`,
    top: `${c.y}vh`,
    fontSize: `${c.size}px`,
    opacity: 0,
    transform: 'scale(0.67)',
    transition: 'none',
    pointerEvents: 'none',
    zIndex: 9999,
    filter: 'drop-shadow(0 0 8px rgba(159, 191, 255, 0.4))',
  })

  useEffect(() => {
    let currentX = c.x
    let currentY = c.y
    let segmentIndex = 0
    const timers: number[] = []

    // Fade in + start growing
    const fadeInTimer = window.setTimeout(() => {
      setStyle((prev) => ({
        ...prev,
        opacity: 0.85,
        transform: 'scale(0.67)',
        transition: 'opacity 0.8s ease-in',
      }))
    }, 50)
    timers.push(fadeInTimer)

    // Grow to full size over first ~3 seconds
    const growTimer = window.setTimeout(() => {
      setStyle((prev) => ({
        ...prev,
        transform: 'scale(1)',
        transition: `${prev.transition}, transform 3s ease-out`,
      }))
    }, 300)
    timers.push(growTimer)

    let elapsed = 800

    for (const segment of c.segments) {
      const targetX = currentX + segment.dx
      const targetY = currentY + segment.dy
      const dur = segment.duration
      const isLast = segmentIndex === c.segments.length - 1

      const capturedX = targetX
      const capturedY = targetY
      const capturedDur = dur

      const timer = window.setTimeout(() => {
        setStyle((prev) => ({
          ...prev,
          left: `${capturedX}vw`,
          top: `${capturedY}vh`,
          opacity: isLast ? 0 : 0.85,
          transition: `left ${capturedDur}s ease-in-out, top ${capturedDur}s ease-in-out, opacity ${isLast ? capturedDur : 0.3}s ease-in-out, transform 3s ease-out`,
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
  }, [c])

  const bobDuration = 1.5 + Math.random() * 1
  const bobAnimation =
    c.type === 'fish'
      ? `fishSwim ${bobDuration}s ease-in-out infinite alternate`
      : `jellyBob ${bobDuration}s ease-in-out infinite alternate`

  return (
    <div style={style}>
      <div style={{ animation: bobAnimation }}>{emoji}</div>
    </div>
  )
}

export default function JellyfishOverlay({ creatures }: Props) {
  return (
    <>
      <style>{`
        @keyframes jellyBob {
          0% { transform: translateY(0px) rotate(-5deg); }
          100% { transform: translateY(-8px) rotate(5deg); }
        }
        @keyframes fishSwim {
          0% { transform: translateY(0px) translateX(-3px) rotate(-3deg); }
          100% { transform: translateY(-4px) translateX(3px) rotate(3deg); }
        }
      `}</style>
      {creatures.map((c) => (
        <AnimatedCreature key={c.id} c={c} />
      ))}
    </>
  )
}
