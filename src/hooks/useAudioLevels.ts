import { useEffect, useRef, useState } from 'react'
import { DailyCall } from '@daily-co/daily-js'

const NOISE_GATE = 0.015
const HOLD_MS = 300

/**
 * Monitors audio levels for all participants via Web Audio API.
 * Returns a map of sessionId -> speaking (true/false).
 */
export function useAudioLevels(callObject: DailyCall | null) {
  const [speaking, setSpeaking] = useState<Record<string, boolean>>({})
  const ctxRef = useRef<AudioContext | null>(null)
  const analysersRef = useRef<
    Map<string, { analyser: AnalyserNode; source: MediaStreamAudioSourceNode }>
  >(new Map())
  const lastActiveRef = useRef<Record<string, number>>({})
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!callObject) return

    const ctx = new AudioContext()
    ctxRef.current = ctx

    const syncTracks = () => {
      const all = callObject.participants()
      const currentIds = new Set<string>()

      for (const [key, p] of Object.entries(all)) {
        const sid = p.session_id
        currentIds.add(sid)

        const audioTrack =
          p.tracks?.audio?.persistentTrack ?? p.tracks?.audio?.track ?? null

        if (audioTrack && audioTrack.readyState === 'live') {
          const existing = analysersRef.current.get(sid)
          if (existing) continue

          try {
            const stream = new MediaStream([audioTrack])
            const source = ctx.createMediaStreamSource(stream)
            const analyser = ctx.createAnalyser()
            analyser.fftSize = 256
            source.connect(analyser)
            analysersRef.current.set(sid, { analyser, source })
          } catch {
            // track may not be usable yet
          }
        }
      }

      // Clean up departed participants
      analysersRef.current.forEach((val, sid) => {
        if (!currentIds.has(sid)) {
          val.source.disconnect()
          analysersRef.current.delete(sid)
          delete lastActiveRef.current[sid]
        }
      })
    }

    const tick = () => {
      const now = Date.now()
      const next: Record<string, boolean> = {}

      analysersRef.current.forEach((val, sid) => {
        const data = new Uint8Array(val.analyser.fftSize)
        val.analyser.getByteTimeDomainData(data)

        let sum = 0
        for (let i = 0; i < data.length; i++) {
          const sample = (data[i] - 128) / 128
          sum += sample * sample
        }
        const rms = Math.sqrt(sum / data.length)

        if (rms >= NOISE_GATE) {
          lastActiveRef.current[sid] = now
        }

        const timeSinceLast = now - (lastActiveRef.current[sid] || 0)
        next[sid] = timeSinceLast < HOLD_MS
      })

      setSpeaking(next)
      rafRef.current = requestAnimationFrame(tick)
    }

    callObject.on('participant-updated', syncTracks)
    callObject.on('participant-joined', syncTracks)
    callObject.on('participant-left', syncTracks)
    callObject.on('track-started', syncTracks)

    syncTracks()
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      callObject.off('participant-updated', syncTracks)
      callObject.off('participant-joined', syncTracks)
      callObject.off('participant-left', syncTracks)
      callObject.off('track-started', syncTracks)
      analysersRef.current.forEach((val) => val.source.disconnect())
      analysersRef.current.clear()
      ctx.close()
    }
  }, [callObject])

  return speaking
}
