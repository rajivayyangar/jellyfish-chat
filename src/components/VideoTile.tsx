import { useEffect, useRef } from 'react'
import { Participant } from '../hooks/useDailyCall'

interface VideoTileProps {
  participant: Participant
  isSpeaking?: boolean
}

export default function VideoTile({ participant, isSpeaking = false }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    if (participant.videoTrack && participant.video) {
      el.srcObject = new MediaStream([participant.videoTrack])
      el.play().catch(() => {})
    } else {
      el.srcObject = null
    }
  }, [participant.videoTrack, participant.video])

  const initials = participant.userName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className={`relative w-full h-full rounded-2xl overflow-hidden bg-jelly-dark border-2 transition-colors duration-200 ${isSpeaking ? 'border-white' : 'border-transparent'}`}>
      {participant.video && participant.videoTrack ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={participant.isLocal}
          className="w-full h-full object-cover"
          style={participant.isLocal ? { transform: 'scaleX(-1)' } : undefined}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-jelly-dark">
          <div className="w-20 h-20 rounded-full bg-jelly-blue/30 flex items-center justify-center">
            <span className="text-2xl font-semibold text-jelly-blue">
              {initials}
            </span>
          </div>
        </div>
      )}

      {/* Name label */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <span className="bg-black/50 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full">
          {participant.userName}
          {participant.isLocal && ' (you)'}
        </span>
        {!participant.audio && (
          <span className="bg-jelly-red/80 text-white text-xs px-2 py-1 rounded-full">
            muted
          </span>
        )}
      </div>
    </div>
  )
}
