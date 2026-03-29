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
  const driftAnimRef = useRef<Animation | null>(null)
  const [reacting, setReacting] = useState(false)

  // Stable random bob duration (computed once per creature)
  const bobDuration = useMemo(() => 1.5 + Math.random() * 1, [])

  const spawnInkCloud = useCallback(() => {
    const el = outerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const radius = c.size * 3

    const ink = document.createElement('div')
    ink.style.cssText = `
      position: fixed; pointer-events: none; z-index: 9998;
      left: ${cx}px; top: ${cy}px;
      width: ${radius * 2}px; height: ${radius * 2}px;
      transform: translate(-50%, -50%) scale(0);
      border-radius: 50%;
      background: radial-gradient(circle, rgba(10,10,15,0.85) 0%, rgba(20,20,30,0.6) 40%, rgba(30,30,40,0.3) 70%, transparent 100%);
      filter: blur(8px);
    `
    document.body.appendChild(ink)

    ink.animate(
      [
        { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
        { transform: 'translate(-50%, -50%) scale(0.6)', opacity: 0.9, offset: 0.15 },
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.7, offset: 0.3 },
        { transform: 'translate(-50%, -50%) scale(1.1)', opacity: 0.4, offset: 0.6 },
        { transform: 'translate(-50%, -50%) scale(1.2)', opacity: 0 },
      ],
      { duration: 5000, easing: 'ease-out', fill: 'forwards' },
    ).onfinish = () => ink.remove()
  }, [c.size])

  const spawnBubbles = useCallback(() => {
    const el = outerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height * 0.3

    const count = 4 + Math.floor(Math.random() * 3)
    for (let i = 0; i < count; i++) {
      const bubble = document.createElement('div')
      const size = 6 + Math.random() * 10
      const xDrift = (Math.random() - 0.5) * 40
      const delay = i * 150 + Math.random() * 100
      bubble.style.cssText = `
        position: fixed; pointer-events: none; z-index: 9998;
        left: ${cx + (Math.random() - 0.5) * 12}px;
        top: ${cy}px;
        width: ${size}px; height: ${size}px;
        border-radius: 50%;
        background: radial-gradient(circle at 30% 30%, rgba(200,220,255,0.6), rgba(140,180,255,0.2));
        border: 1px solid rgba(180,210,255,0.4);
        opacity: 0;
      `
      document.body.appendChild(bubble)

      bubble.animate(
        [
          { transform: `translate(-50%, 0) scale(0.5)`, opacity: 0, offset: 0 },
          { transform: `translate(calc(-50% + ${xDrift * 0.3}px), -30px) scale(1)`, opacity: 0.8, offset: 0.15 },
          { transform: `translate(calc(-50% + ${xDrift * 0.7}px), -80px) scale(1.05)`, opacity: 0.6, offset: 0.4 },
          { transform: `translate(calc(-50% + ${xDrift}px), -150px) scale(0.9)`, opacity: 0.3, offset: 0.7 },
          { transform: `translate(calc(-50% + ${xDrift * 1.1}px), -220px) scale(0.6)`, opacity: 0 },
        ],
        { duration: 5000, delay, easing: 'ease-out', fill: 'forwards' },
      ).onfinish = () => bubble.remove()
    }
  }, [])

  const handleTap = useCallback(() => {
    if (reacting || !innerRef.current) return
    setReacting(true)
    driftAnimRef.current?.pause()

    if (c.type === 'seahorse') {
      // Squid: stay 2s, then squirt ink and resume
      setTimeout(() => {
        spawnInkCloud()
        driftAnimRef.current?.play()
        setReacting(false)
      }, 2000)
    } else if (c.type === 'fish') {
      // Fish: wiggle for 2s, then blow bubbles and resume
      const wiggle = TAP_ANIMATIONS[2] // wiggle keyframes
      const anim = innerRef.current.animate(wiggle, {
        duration: 2000,
        easing: 'ease-in-out',
      })
      anim.onfinish = () => {
        spawnBubbles()
        driftAnimRef.current?.play()
        setReacting(false)
      }
    } else {
      const keyframes = TAP_ANIMATIONS[Math.floor(Math.random() * TAP_ANIMATIONS.length)]
      const anim = innerRef.current.animate(keyframes, {
        duration: 2000,
        easing: 'ease-in-out',
      })
      anim.onfinish = () => {
        driftAnimRef.current?.play()
        setReacting(false)
      }
    }
  }, [reacting, c.type, spawnInkCloud, spawnBubbles])

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
    driftAnimRef.current = animation

    return () => {
      animation.cancel()
      driftAnimRef.current = null
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
