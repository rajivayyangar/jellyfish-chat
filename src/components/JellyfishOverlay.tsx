import { useEffect, useRef, useMemo, useCallback, useState } from 'react'
import { Creature, CREATURE_EMOJI } from '../hooks/useJellyfish'

interface Props {
  creatures: Creature[]
}

const TAP_ANIMATIONS: Keyframe[][] = [
  // Pulse: grow and shrink
  [
    { transform: 'scale(1)', offset: 0 },
    { transform: 'scale(1.4)', offset: 0.15 },
    { transform: 'scale(0.9)', offset: 0.35 },
    { transform: 'scale(1.3)', offset: 0.55 },
    { transform: 'scale(0.95)', offset: 0.75 },
    { transform: 'scale(1.15)', offset: 0.9 },
    { transform: 'scale(1)', offset: 1 },
  ],
  // Rotate: spin around
  [
    { transform: 'rotate(0deg)', offset: 0 },
    { transform: 'rotate(120deg)', offset: 0.25 },
    { transform: 'rotate(240deg)', offset: 0.5 },
    { transform: 'rotate(320deg)', offset: 0.7 },
    { transform: 'rotate(380deg)', offset: 0.85 },
    { transform: 'rotate(360deg)', offset: 1 },
  ],
  // Wiggle: shake side to side
  [
    { transform: 'translateX(0) rotate(0deg)', offset: 0 },
    { transform: 'translateX(-8px) rotate(-12deg)', offset: 0.1 },
    { transform: 'translateX(8px) rotate(12deg)', offset: 0.2 },
    { transform: 'translateX(-6px) rotate(-10deg)', offset: 0.3 },
    { transform: 'translateX(6px) rotate(10deg)', offset: 0.4 },
    { transform: 'translateX(-5px) rotate(-8deg)', offset: 0.5 },
    { transform: 'translateX(5px) rotate(8deg)', offset: 0.6 },
    { transform: 'translateX(-3px) rotate(-5deg)', offset: 0.7 },
    { transform: 'translateX(3px) rotate(5deg)', offset: 0.8 },
    { transform: 'translateX(-1px) rotate(-2deg)', offset: 0.9 },
    { transform: 'translateX(0) rotate(0deg)', offset: 1 },
  ],
]

function AnimatedCreature({ c }: { c: Creature }) {
  const emoji = CREATURE_EMOJI[c.type] || '🪼'
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [reacting, setReacting] = useState(false)

  // Stable random bob duration (computed once per creature)
  const bobDuration = useMemo(() => 1.5 + Math.random() * 1, [])

  const handleTap = useCallback(() => {
    if (reacting || !innerRef.current) return
    setReacting(true)
    const keyframes = TAP_ANIMATIONS[Math.floor(Math.random() * TAP_ANIMATIONS.length)]
    const anim = innerRef.current.animate(keyframes, {
      duration: 2000,
      easing: 'ease-in-out',
    })
    anim.onfinish = () => setReacting(false)
  }, [reacting])

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
        pointerEvents: 'auto',
        cursor: 'pointer',
        zIndex: 9999,
        filter: 'drop-shadow(0 0 8px rgba(159, 191, 255, 0.4))',
        willChange: 'transform, opacity',
      }}
      onClick={handleTap}
    >
      <div
        ref={innerRef}
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
      {creatures.map((c) => (
        <AnimatedCreature key={c.id} c={c} />
      ))}
    </>
  )
}
