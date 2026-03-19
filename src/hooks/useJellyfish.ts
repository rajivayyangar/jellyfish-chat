import { useCallback, useEffect, useRef, useState } from 'react'
import { DailyCall } from '@daily-co/daily-js'

export interface Jellyfish {
  id: string
  x: number // starting x position (0-100 vw%)
  y: number // starting y position (starts at bottom)
  createdAt: number
  // Each jellyfish gets a random sequence of drift segments
  segments: { dx: number; dy: number; duration: number }[]
  size: number // 28-48px
}

let jellyfishCounter = 0

function createJellyfish(): Jellyfish {
  const id = `jf-${Date.now()}-${jellyfishCounter++}`
  const x = 10 + Math.random() * 80 // 10-90% from left
  const y = 85 + Math.random() * 10 // start near bottom

  // Generate 3-5 drift segments
  const numSegments = 3 + Math.floor(Math.random() * 3)
  const segments: Jellyfish['segments'] = []
  for (let i = 0; i < numSegments; i++) {
    segments.push({
      dx: (Math.random() - 0.5) * 30, // drift -15 to +15 vw%
      dy: -(5 + Math.random() * 15), // drift upward 5-20 vh%
      duration: 2 + Math.random() * 2, // 2-4 seconds per segment
    })
  }

  const size = 28 + Math.random() * 20

  return { id, x, y, createdAt: Date.now(), segments, size }
}

export function useJellyfish(callObject: DailyCall | null) {
  const [jellies, setJellies] = useState<Jellyfish[]>([])
  const cleanupTimers = useRef<Map<string, number>>(new Map())

  const addJellyfish = useCallback((jf: Jellyfish) => {
    setJellies((prev) => [...prev, jf])

    // Calculate total duration from segments
    const totalDuration = jf.segments.reduce((sum, s) => sum + s.duration, 0)
    const lifetime = totalDuration * 1000 + 1000 // extra second for fade

    const timer = window.setTimeout(() => {
      setJellies((prev) => prev.filter((j) => j.id !== jf.id))
      cleanupTimers.current.delete(jf.id)
    }, lifetime)

    cleanupTimers.current.set(jf.id, timer)
  }, [])

  const spawnJellyfish = useCallback(() => {
    const jf = createJellyfish()
    addJellyfish(jf)

    // Broadcast to other participant
    if (callObject) {
      callObject.sendAppMessage({ type: 'jellyfish', jellyfish: jf }, '*')
    }
  }, [callObject, addJellyfish])

  // Listen for incoming jellyfish from other participant
  useEffect(() => {
    if (!callObject) return

    const handler = (event: any) => {
      if (event?.data?.type === 'jellyfish') {
        addJellyfish(event.data.jellyfish)
      }
    }

    callObject.on('app-message', handler)
    return () => {
      callObject.off('app-message', handler)
    }
  }, [callObject, addJellyfish])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      cleanupTimers.current.forEach((timer) => clearTimeout(timer))
    }
  }, [])

  return { jellies, spawnJellyfish }
}
