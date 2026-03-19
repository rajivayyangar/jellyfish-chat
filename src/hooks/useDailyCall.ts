import { useEffect, useRef, useState, useCallback } from 'react'
import DailyIframe, { DailyCall, DailyParticipant } from '@daily-co/daily-js'
import { extractVideoTrack } from './dailyUtils'

export interface Participant {
  sessionId: string
  userName: string
  isLocal: boolean
  audio: boolean
  video: boolean
  videoTrack: MediaStreamTrack | null
}

function toParticipant(p: DailyParticipant): Participant {
  return {
    sessionId: p.session_id,
    userName: p.user_name || 'Guest',
    isLocal: p.local,
    audio: p.audio ?? false,
    video: p.video ?? false,
    videoTrack: extractVideoTrack(p),
  }
}

export function useDailyCall(roomUrl: string | null, userName: string) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isJoined, setIsJoined] = useState(false)
  const [localIsMuted, setLocalIsMuted] = useState(false)
  const [localCameraOff, setLocalCameraOff] = useState(false)
  const callRef = useRef<DailyCall | null>(null)
  const destroyedRef = useRef(false)

  const refreshParticipants = useCallback(() => {
    const co = callRef.current
    if (!co || destroyedRef.current) return
    try {
      const all = co.participants()
      const list: Participant[] = []
      if (all.local) list.push(toParticipant(all.local))
      for (const [id, p] of Object.entries(all)) {
        if (id !== 'local') list.push(toParticipant(p))
      }
      setParticipants(list)
    } catch {
      // call object may be destroyed
    }
  }, [])

  const syncLocalState = useCallback(() => {
    const co = callRef.current
    if (!co || destroyedRef.current) return
    try {
      const local = co.participants().local
      if (!local) return
      setLocalIsMuted(!local.audio)
      setLocalCameraOff(!local.video)
      refreshParticipants()
    } catch {
      // call object may be destroyed
    }
  }, [refreshParticipants])

  useEffect(() => {
    if (!roomUrl || !userName) return
    if (callRef.current) return

    destroyedRef.current = false
    const co = DailyIframe.createCallObject()
    callRef.current = co

    co.on('joined-meeting', () => {
      setIsJoined(true)
      syncLocalState()
    })
    co.on('left-meeting', () => {
      setIsJoined(false)
      setParticipants([])
    })
    // participant-updated covers track changes too, no need for track-started/stopped
    co.on('participant-updated', syncLocalState)
    co.on('participant-joined', refreshParticipants)
    co.on('participant-left', refreshParticipants)

    co.join({ url: roomUrl, userName })

    return () => {
      destroyedRef.current = true
      co.leave().catch(() => {})
      co.destroy()
      callRef.current = null
    }
  }, [roomUrl, userName, syncLocalState, refreshParticipants])

  const toggleMute = useCallback(() => {
    callRef.current?.setLocalAudio(localIsMuted)
  }, [localIsMuted])

  const toggleCamera = useCallback(() => {
    callRef.current?.setLocalVideo(localCameraOff)
  }, [localCameraOff])

  return {
    participants,
    isJoined,
    localIsMuted,
    localCameraOff,
    toggleMute,
    toggleCamera,
    callObject: callRef.current,
  }
}
