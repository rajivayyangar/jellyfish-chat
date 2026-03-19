import { useEffect, useRef } from 'react'
import { DailyCall } from '@daily-co/daily-js'

/**
 * Creates <audio> elements for remote participants so you can hear them.
 * Must use the DailyCall object directly to access raw audio tracks.
 */
export function useRemoteAudio(callObject: DailyCall | null) {
  const audioEls = useRef<Map<string, HTMLAudioElement>>(new Map())

  useEffect(() => {
    if (!callObject) return

    const updateAudio = () => {
      const all = callObject.participants()
      const remoteIds = new Set<string>()

      for (const [id, p] of Object.entries(all)) {
        if (id === 'local') continue
        remoteIds.add(p.session_id)

        const audioTrack =
          p.tracks?.audio?.persistentTrack ?? p.tracks?.audio?.track ?? null

        if (audioTrack && audioTrack.readyState === 'live') {
          let el = audioEls.current.get(p.session_id)
          if (!el) {
            el = document.createElement('audio')
            el.autoplay = true
            document.body.appendChild(el)
            audioEls.current.set(p.session_id, el)
          }
          const existing = el.srcObject as MediaStream | null
          if (!existing || existing.getAudioTracks()[0]?.id !== audioTrack.id) {
            el.srcObject = new MediaStream([audioTrack])
          }
        }
      }

      // Remove elements for departed participants
      audioEls.current.forEach((el, sid) => {
        if (!remoteIds.has(sid)) {
          el.pause()
          el.srcObject = null
          el.remove()
          audioEls.current.delete(sid)
        }
      })
    }

    callObject.on('participant-updated', updateAudio)
    callObject.on('participant-joined', updateAudio)
    callObject.on('participant-left', updateAudio)
    callObject.on('track-started', updateAudio)
    callObject.on('track-stopped', updateAudio)

    // Initial sync
    updateAudio()

    return () => {
      callObject.off('participant-updated', updateAudio)
      callObject.off('participant-joined', updateAudio)
      callObject.off('participant-left', updateAudio)
      callObject.off('track-started', updateAudio)
      callObject.off('track-stopped', updateAudio)
      audioEls.current.forEach((el) => {
        el.pause()
        el.srcObject = null
        el.remove()
      })
      audioEls.current.clear()
    }
  }, [callObject])
}
