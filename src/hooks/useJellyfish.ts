import { useCallback, useEffect, useRef, useState } from 'react'
import { DailyCall } from '@daily-co/daily-js'

export type CreatureType = 'jellyfish' | 'seahorse' | 'fish'

export const CREATURE_EMOJI: Record<CreatureType, string> = {
  jellyfish: '🪼',
  seahorse: '🦑',
  fish: '🐠',
}

export interface Creature {
  id: string
  type: CreatureType
  x: number
  y: number
  createdAt: number
  segments: { dx: number; dy: number; duration: number }[]
  size: number
}

let creatureCounter = 0

function createCreature(type: CreatureType): Creature {
  const id = `cr-${Date.now()}-${creatureCounter++}`
  const x = 10 + Math.random() * 80
  const y = 85 + Math.random() * 10

  const numSegments = 3 + Math.floor(Math.random() * 3)
  const segments: Creature['segments'] = []
  for (let i = 0; i < numSegments; i++) {
    segments.push({
      dx: (Math.random() - 0.5) * 30,
      dy: -(5 + Math.random() * 15),
      duration: 2 + Math.random() * 2,
    })
  }

  const size = 28 + Math.random() * 20

  return { id, type, x, y, createdAt: Date.now(), segments, size }
}

export interface CreatureTap {
  creatureId: string
  animIndex: number
}

export function useCreatures(callObject: DailyCall | null) {
  const [creatures, setCreatures] = useState<Creature[]>([])
  const [pendingTaps, setPendingTaps] = useState<CreatureTap[]>([])
  const cleanupTimers = useRef<Map<string, number>>(new Map())

  const addCreature = useCallback((c: Creature) => {
    setCreatures((prev) => [...prev, c])

    const totalDuration = c.segments.reduce((sum, s) => sum + s.duration, 0)
    const lifetime = totalDuration * 1000 + 1000

    const timer = window.setTimeout(() => {
      setCreatures((prev) => prev.filter((j) => j.id !== c.id))
      cleanupTimers.current.delete(c.id)
    }, lifetime)

    cleanupTimers.current.set(c.id, timer)
  }, [])

  const spawnCreature = useCallback(
    (type: CreatureType) => {
      const c = createCreature(type)
      addCreature(c)

      if (callObject) {
        callObject.sendAppMessage({ type: 'creature', creature: c }, '*')
      }
    },
    [callObject, addCreature],
  )

  const tapCreature = useCallback(
    (creatureId: string, animIndex: number) => {
      if (callObject) {
        callObject.sendAppMessage(
          { type: 'creature-tap', creatureId, animIndex },
          '*',
        )
      }
    },
    [callObject],
  )

  const consumeTap = useCallback((creatureId: string) => {
    setPendingTaps((prev) => prev.filter((t) => t.creatureId !== creatureId))
  }, [])

  useEffect(() => {
    if (!callObject) return

    const handler = (event: any) => {
      if (event?.data?.type === 'creature') {
        addCreature(event.data.creature)
      }
      if (event?.data?.type === 'creature-tap') {
        setPendingTaps((prev) => [
          ...prev,
          { creatureId: event.data.creatureId, animIndex: event.data.animIndex },
        ])
      }
      // backwards compat with old jellyfish messages
      if (event?.data?.type === 'jellyfish') {
        addCreature({ ...event.data.jellyfish, type: 'jellyfish' })
      }
    }

    callObject.on('app-message', handler)
    return () => {
      callObject.off('app-message', handler)
    }
  }, [callObject, addCreature])

  useEffect(() => {
    return () => {
      cleanupTimers.current.forEach((timer) => clearTimeout(timer))
    }
  }, [])

  return { creatures, spawnCreature, tapCreature, pendingTaps, consumeTap }
}
