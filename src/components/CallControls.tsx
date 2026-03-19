import { CreatureType, CREATURE_EMOJI } from '../hooks/useJellyfish'

interface CallControlsProps {
  localIsMuted: boolean
  localCameraOff: boolean
  onToggleMute: () => void
  onToggleCamera: () => void
  onSpawnCreature: (type: CreatureType) => void
  onLeave: () => void
}

const CREATURE_BUTTONS = (Object.keys(CREATURE_EMOJI) as CreatureType[]).map(
  (type) => ({ type, emoji: CREATURE_EMOJI[type], label: `Release a ${type}!` }),
)

export default function CallControls({
  localIsMuted,
  localCameraOff,
  onToggleMute,
  onToggleCamera,
  onSpawnCreature,
  onLeave,
}: CallControlsProps) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 p-4">
      {/* Mute */}
      <button
        onClick={onToggleMute}
        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg transition-colors ${
          localIsMuted
            ? 'bg-jelly-red text-white'
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
        title={localIsMuted ? 'Unmute' : 'Mute'}
      >
        {localIsMuted ? '🔇' : '🎙️'}
      </button>

      {/* Camera */}
      <button
        onClick={onToggleCamera}
        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg transition-colors ${
          localCameraOff
            ? 'bg-jelly-red text-white'
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
        title={localCameraOff ? 'Turn on camera' : 'Turn off camera'}
      >
        {localCameraOff ? '📷' : '📹'}
      </button>

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
