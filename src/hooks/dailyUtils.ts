import { DailyParticipant } from '@daily-co/daily-js'

export function extractAudioTrack(p: DailyParticipant): MediaStreamTrack | null {
  return p.tracks?.audio?.persistentTrack ?? p.tracks?.audio?.track ?? null
}

export function extractVideoTrack(p: DailyParticipant): MediaStreamTrack | null {
  return (
    (p as any).videoTrack ??
    p.tracks?.video?.persistentTrack ??
    p.tracks?.video?.track ??
    null
  )
}
