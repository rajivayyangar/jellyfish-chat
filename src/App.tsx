import { useState, useRef } from 'react'
import { useDailyCall } from './hooks/useDailyCall'
import { useDevices } from './hooks/useDevices'
import { useCreatures } from './hooks/useJellyfish'
import { useRemoteAudio } from './hooks/useRemoteAudio'
import { useAudioLevels } from './hooks/useAudioLevels'
import VideoTile from './components/VideoTile'
import CallControls from './components/CallControls'
import JellyfishOverlay from './components/JellyfishOverlay'

const ROOM_URL = import.meta.env.VITE_DAILY_ROOM_URL as string | undefined

function spawnSparkles(container: HTMLElement) {
  const rect = container.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2

  for (let i = 0; i < 18; i++) {
    const sparkle = document.createElement('div')
    sparkle.textContent = ['✨', '⭐', '💫', '🌟'][Math.floor(Math.random() * 4)]
    sparkle.style.cssText = `
      position: fixed; pointer-events: none; z-index: 9999;
      left: ${cx}px; top: ${cy}px; font-size: ${12 + Math.random() * 14}px;
    `
    document.body.appendChild(sparkle)

    const angle = (Math.PI * 2 * i) / 18 + (Math.random() - 0.5) * 0.5
    const dist = 60 + Math.random() * 80
    const tx = Math.cos(angle) * dist
    const ty = Math.sin(angle) * dist

    sparkle.animate(
      [
        { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
        { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(1.2)`, opacity: 1, offset: 0.4 },
        { transform: `translate(calc(-50% + ${tx * 1.3}px), calc(-50% + ${ty * 1.3 + 20}px)) scale(0)`, opacity: 0 },
      ],
      { duration: 800 + Math.random() * 400, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)', fill: 'forwards' },
    ).onfinish = () => sparkle.remove()
  }
}

function LobbyScreen({
  onJoin,
}: {
  onJoin: (name: string, room: string) => void
}) {
  const [room, setRoom] = useState(ROOM_URL || '')
  const [ellieAnimating, setEllieAnimating] = useState(false)
  const ellieRef = useRef<HTMLButtonElement>(null)

  const handleJoin = (name: string) => {
    if (!room) return
    sessionStorage.setItem('jf-name', name)
    onJoin(name, room)
  }

  const handleEllie = () => {
    if (ellieAnimating) return
    setEllieAnimating(true)

    if (ellieRef.current) {
      spawnSparkles(ellieRef.current)
      ellieRef.current.animate(
        [
          { transform: 'scale(1) rotate(0deg)' },
          { transform: 'scale(1.15) rotate(-8deg)', offset: 0.1 },
          { transform: 'scale(0.9) rotate(10deg)', offset: 0.25 },
          { transform: 'scale(1.2) rotate(-6deg)', offset: 0.4 },
          { transform: 'scale(0.95) rotate(8deg)', offset: 0.55 },
          { transform: 'scale(1.1) rotate(-4deg)', offset: 0.7 },
          { transform: 'scale(1.05) rotate(2deg)', offset: 0.85 },
          { transform: 'scale(1) rotate(0deg)' },
        ],
        { duration: 1400, easing: 'ease-in-out' },
      ).onfinish = () => {
        setEllieAnimating(false)
        handleJoin('Ellie')
      }
    }
  }

  return (
    <div className="h-full flex items-center justify-center bg-jelly-dark p-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="text-6xl mb-2">🪼</div>
        <h1 className="text-3xl font-bold text-jelly-yellow">Jellyfish Chat</h1>
        <p className="text-jelly-blue/70 text-sm">Who's joining?</p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => handleJoin('Rajiv')}
            className="flex-1 py-4 rounded-2xl bg-jelly-blue/20 hover:bg-jelly-blue/40 text-white font-semibold text-xl transition-colors border-2 border-jelly-blue/30 active:scale-95"
          >
            Rajiv
          </button>
          <button
            ref={ellieRef}
            onClick={handleEllie}
            className="flex-1 py-4 rounded-2xl bg-jelly-yellow/20 hover:bg-jelly-yellow/40 text-white font-semibold text-xl transition-colors border-2 border-jelly-yellow/30"
          >
            Ellie
          </button>
        </div>

        {!ROOM_URL && (
          <input
            type="text"
            placeholder="Daily.co room URL"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-jelly-blue/50 text-center text-sm"
          />
        )}
      </div>
    </div>
  )
}

function CallScreen({
  roomUrl,
  userName,
  onLeave,
}: {
  roomUrl: string
  userName: string
  onLeave: () => void
}) {
  const {
    participants,
    isJoined,
    localIsMuted,
    localCameraOff,
    toggleMute,
    toggleCamera,
    callObject,
  } = useDailyCall(roomUrl, userName)

  const devices = useDevices(callObject)
  const { creatures, spawnCreature } = useCreatures(callObject)
  useRemoteAudio(callObject)
  const speaking = useAudioLevels(callObject)

  if (!isJoined) {
    return (
      <div className="h-full flex items-center justify-center bg-jelly-dark">
        <div className="text-center space-y-4">
          <div className="text-5xl animate-pulse">🪼</div>
          <p className="text-jelly-blue/70">Joining...</p>
        </div>
      </div>
    )
  }

  const localParticipant = participants.find((p) => p.isLocal)
  const remoteParticipant = participants.find((p) => !p.isLocal)

  return (
    <div className="h-full flex flex-col bg-jelly-dark">
      {/* Video area */}
      <div className="flex-1 relative overflow-hidden p-3">
        {/* Remote participant (main view) or waiting message */}
        {remoteParticipant ? (
          <VideoTile participant={remoteParticipant} isSpeaking={speaking[remoteParticipant.sessionId]} />
        ) : (
          <div className="w-full h-full rounded-2xl bg-jelly-dark/50 border border-white/5 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="text-4xl">🪼</div>
              <p className="text-jelly-blue/50 text-sm">
                Waiting for the other jellyfish...
              </p>
            </div>
          </div>
        )}

        {/* Local participant (picture-in-picture) */}
        {localParticipant && (
          <div className={`absolute bottom-5 right-5 w-28 h-40 sm:w-36 sm:h-48 rounded-xl overflow-hidden shadow-lg border-2 transition-colors duration-200 ${speaking[localParticipant.sessionId] ? 'border-white' : 'border-jelly-blue/20'}`}>
            <VideoTile participant={localParticipant} isSpeaking={speaking[localParticipant.sessionId]} />
          </div>
        )}
      </div>

      {/* Controls */}
      <CallControls
        localIsMuted={localIsMuted}
        localCameraOff={localCameraOff}
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
        onSpawnCreature={spawnCreature}
        onLeave={onLeave}
        mics={devices.mics}
        cameras={devices.cameras}
        speakers={devices.speakers}
        selectedMic={devices.selectedMic}
        selectedCamera={devices.selectedCamera}
        selectedSpeaker={devices.selectedSpeaker}
        onSelectMic={devices.setMic}
        onSelectCamera={devices.setCamera}
        onSelectSpeaker={devices.setSpeaker}
      />

      {/* Jellyfish overlay */}
      <JellyfishOverlay creatures={creatures} />
    </div>
  )
}

export default function App() {
  const [callState, setCallState] = useState<{
    roomUrl: string
    userName: string
  } | null>(null)

  if (!callState) {
    return (
      <LobbyScreen
        onJoin={(name, room) => setCallState({ roomUrl: room, userName: name })}
      />
    )
  }

  return (
    <CallScreen
      roomUrl={callState.roomUrl}
      userName={callState.userName}
      onLeave={() => setCallState(null)}
    />
  )
}
