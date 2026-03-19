import { useState, useCallback } from 'react'
import { useDailyCall } from './hooks/useDailyCall'
import { useCreatures } from './hooks/useJellyfish'
import { useRemoteAudio } from './hooks/useRemoteAudio'
import { useAudioLevels } from './hooks/useAudioLevels'
import VideoTile from './components/VideoTile'
import CallControls from './components/CallControls'
import JellyfishOverlay from './components/JellyfishOverlay'

const ROOM_URL = import.meta.env.VITE_DAILY_ROOM_URL as string | undefined

function LobbyScreen({
  onJoin,
}: {
  onJoin: (name: string, room: string) => void
}) {
  const [name, setName] = useState(() => sessionStorage.getItem('jf-name') || '')
  const [room, setRoom] = useState(ROOM_URL || '')

  const handleJoin = () => {
    if (!name.trim() || !room.trim()) return
    sessionStorage.setItem('jf-name', name.trim())
    onJoin(name.trim(), room.trim())
  }

  return (
    <div className="h-full flex items-center justify-center bg-jelly-dark p-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="text-6xl mb-2">🪼</div>
        <h1 className="text-3xl font-bold text-jelly-yellow">Jellyfish Chat</h1>
        <p className="text-jelly-blue/70 text-sm">A cozy video call for two</p>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-jelly-blue/50 text-center"
            autoFocus
          />
          {!ROOM_URL && (
            <input
              type="text"
              placeholder="Daily.co room URL"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-jelly-blue/50 text-center text-sm"
            />
          )}
        </div>

        <button
          onClick={handleJoin}
          disabled={!name.trim() || !room.trim()}
          className="w-full py-3 rounded-xl bg-jelly-blue text-jelly-dark font-semibold text-lg hover:bg-jelly-blue/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Join
        </button>
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

  const { creatures, spawnCreature } = useCreatures(callObject)
  useRemoteAudio(callObject)
  const speaking = useAudioLevels(callObject)

  const handleLeave = useCallback(() => {
    onLeave()
  }, [onLeave])

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
        <div className="w-full h-full">
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
        </div>

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
        onLeave={handleLeave}
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
