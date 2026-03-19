import { useEffect, useRef, useMemo } from 'react'
import { Creature, CREATURE_EMOJI } from '../hooks/useJellyfish'

interface Props {
  creatures: Creature[]
}

function AnimatedCreature({ c }: { c: Creature }) {
  const emoji = CREATURE_EMOJI[c.type] || '🪼'
  const outerRef = useRef<HTMLDivElement>(null)

  // Stable random bob duration (computed once per creature)
  const bobDuration = useMemo(() => 1.5 + Math.random() * 1, [])

  useEffect(() => {
    const el = outerRef.current
    if (!el) return

    // Build keyframes from segments using transform (compositor-friendly)
    const totalDuration = c.segments.reduce((sum, s) => sum + s.duration, 0)
    const totalMs = totalDuration * 1000

    // Fade-in takes 800ms, grow takes 3s from start
    const fadeInFraction = Math.min(800 / totalMs, 0.15)
    const growFraction = Math.min(3000 / totalMs, 0.5)

    const keyframes: Keyframe[] = []
    let currentX = 0 // offsets from starting position (in vw)
    let currentY = 0
    let cumulativeTime = 0

    // Start: invisible, small
    keyframes.push({
      transform: `translate(0vw, 0vh) scale(0.67)`,
      opacity: 0,
      offset: 0,
    })

    // Fade in (at fadeInFraction of total)
    keyframes.push({
      transform: `translate(0vw, 0vh) scale(0.67)`,
      opacity: 0.85,
      offset: fadeInFraction,
    })

    // Each drift segment
    for (let i = 0; i < c.segments.length; i++) {
      const seg = c.segments[i]
      currentX += seg.dx
      currentY += seg.dy
      cumulativeTime += seg.duration

      const offset = cumulativeTime / totalDuration
      const isLast = i === c.segments.length - 1
      // Scale grows from 0.67 to 1.0 over the growFraction period
      const scale = offset >= growFraction ? 1 : 0.67 + 0.33 * (offset / growFraction)

      keyframes.push({
        transform: `translate(${currentX}vw, ${currentY}vh) scale(${scale.toFixed(3)})`,
        opacity: isLast ? 0 : 0.85,
        offset: Math.min(offset, 1),
      })
    }

    const animation = el.animate(keyframes, {
      duration: totalMs,
      easing: 'ease-in-out',
      fill: 'forwards',
    })

    return () => {
      animation.cancel()
    }
  }, [c])

  return (
    <div
      ref={outerRef}
      style={{
        position: 'fixed',
        left: `${c.x}vw`,
        top: `${c.y}vh`,
        fontSize: `${c.size}px`,
        opacity: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        filter: 'drop-shadow(0 0 8px rgba(159, 191, 255, 0.4))',
        willChange: 'transform, opacity',
      }}
    >
      <div
        style={{
          animation:
            c.type === 'fish'
              ? `fishSwim ${bobDuration}s ease-in-out infinite alternate`
              : `jellyBob ${bobDuration}s ease-in-out infinite alternate`,
        }}
      >
        {emoji}
      </div>
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
