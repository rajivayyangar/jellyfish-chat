import { useState, useRef, useEffect } from 'react'
import { CreatureType, CREATURE_EMOJI } from '../hooks/useJellyfish'
import { DeviceInfo } from '../hooks/useDevices'

interface CallControlsProps {
  localIsMuted: boolean
  localCameraOff: boolean
  onToggleMute: () => void
  onToggleCamera: () => void
  onSpawnCreature: (type: CreatureType) => void
  onLeave: () => void
  mics: DeviceInfo[]
  cameras: DeviceInfo[]
  speakers: DeviceInfo[]
  selectedMic: string
  selectedCamera: string
  selectedSpeaker: string
  onSelectMic: (id: string) => void
  onSelectCamera: (id: string) => void
  onSelectSpeaker: (id: string) => void
}

const CREATURE_BUTTONS = (Object.keys(CREATURE_EMOJI) as CreatureType[]).map(
  (type) => ({ type, emoji: CREATURE_EMOJI[type], label: `Release a ${type}!` }),
)

function DeviceDropdown({
  devices,
  selectedId,
  onSelect,
  open,
  onClose,
}: {
  devices: DeviceInfo[]
  selectedId: string
  onSelect: (id: string) => void
  open: boolean
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  if (!open || devices.length === 0) return null

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-xl bg-gray-800 border border-white/10 shadow-xl overflow-hidden z-50"
    >
      {devices.map((d) => (
        <button
          key={d.deviceId}
          onClick={() => {
            onSelect(d.deviceId)
            onClose()
          }}
          className={`w-full px-3 py-2 text-left text-xs truncate transition-colors ${
            d.deviceId === selectedId
              ? 'bg-jelly-blue/30 text-white'
              : 'text-white/70 hover:bg-white/10'
          }`}
        >
          {d.label}
        </button>
      ))}
    </div>
  )
}

export default function CallControls({
  localIsMuted,
  localCameraOff,
  onToggleMute,
  onToggleCamera,
  onSpawnCreature,
  onLeave,
  mics,
  cameras,
  speakers,
  selectedMic,
  selectedCamera,
  selectedSpeaker,
  onSelectMic,
  onSelectCamera,
  onSelectSpeaker,
}: CallControlsProps) {
  const [openDropdown, setOpenDropdown] = useState<'mic' | 'camera' | 'speaker' | null>(null)

  const toggleDropdown = (which: 'mic' | 'camera' | 'speaker') => {
    setOpenDropdown((prev) => (prev === which ? null : which))
  }

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 p-4">
      {/* Mute + mic selector */}
      <div className="relative flex items-center">
        <button
          onClick={onToggleMute}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg transition-colors ${
            localIsMuted
              ? 'bg-jelly-red text-white'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
          title={localIsMuted ? 'unmute' : 'mute'}
        >
          {localIsMuted ? '🔇' : '🎙️'}
        </button>
        {mics.length > 1 && (
          <button
            onClick={() => toggleDropdown('mic')}
            className="ml-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-white/10 text-white/60 hover:bg-white/20 transition-colors"
            title="Select microphone"
          >
            ▾
          </button>
        )}
        <DeviceDropdown
          devices={mics}
          selectedId={selectedMic}
          onSelect={onSelectMic}
          open={openDropdown === 'mic'}
          onClose={() => setOpenDropdown(null)}
        />
      </div>

      {/* Camera + camera selector */}
      <div className="relative flex items-center">
        <button
          onClick={onToggleCamera}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg transition-colors ${
            localCameraOff
              ? 'bg-jelly-red text-white'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
          title={localCameraOff ? 'turn on video' : 'turn off video'}
        >
          {localCameraOff ? '📷' : '📹'}
        </button>
        {cameras.length > 1 && (
          <button
            onClick={() => toggleDropdown('camera')}
            className="ml-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-white/10 text-white/60 hover:bg-white/20 transition-colors"
            title="Select camera"
          >
            ▾
          </button>
        )}
        <DeviceDropdown
          devices={cameras}
          selectedId={selectedCamera}
          onSelect={onSelectCamera}
          open={openDropdown === 'camera'}
          onClose={() => setOpenDropdown(null)}
        />
      </div>

      {/* Speaker selector */}
      <div className="relative flex items-center">
        <button
          onClick={() => toggleDropdown('speaker')}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          title="select speaker device"
        >
          🔊
        </button>
        <DeviceDropdown
          devices={speakers}
          selectedId={selectedSpeaker}
          onSelect={onSelectSpeaker}
          open={openDropdown === 'speaker'}
          onClose={() => setOpenDropdown(null)}
        />
      </div>

      {/* Creature buttons */}
      {CREATURE_BUTTONS.map(({ type, emoji, label }) => (
        <button
          key={type}
          onClick={() => onSpawnCreature(type)}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-xl sm:text-2xl bg-jelly-blue/20 hover:bg-jelly-blue/40 transition-colors border-2 border-jelly-blue/30 active:scale-90"
          title={label}
        >
          {emoji}
        </button>
      ))}

      {/* Leave */}
      <button
        onClick={onLeave}
        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-jelly-red hover:bg-red-600 text-white text-sm font-medium transition-colors"
        title="Leave call"
      >
        ✕
      </button>
    </div>
  )
}
