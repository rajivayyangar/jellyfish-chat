interface CallControlsProps {
  localIsMuted: boolean
  localCameraOff: boolean
  onToggleMute: () => void
  onToggleCamera: () => void
  onSpawnJellyfish: () => void
  onLeave: () => void
}

export default function CallControls({
  localIsMuted,
  localCameraOff,
  onToggleMute,
  onToggleCamera,
  onSpawnJellyfish,
  onLeave,
}: CallControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3 p-4">
      {/* Mute */}
      <button
        onClick={onToggleMute}
        className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-colors ${
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
        className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-colors ${
          localCameraOff
            ? 'bg-jelly-red text-white'
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
        title={localCameraOff ? 'Turn on camera' : 'Turn off camera'}
      >
        {localCameraOff ? '📷' : '📹'}
      </button>

      {/* Jellyfish! */}
      <button
        onClick={onSpawnJellyfish}
        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl bg-jelly-blue/30 hover:bg-jelly-blue/50 transition-colors border-2 border-jelly-blue/40 active:scale-90 transition-transform"
        title="Release a jellyfish!"
      >
        🪼
      </button>

      {/* Leave */}
      <button
        onClick={onLeave}
        className="w-12 h-12 rounded-full flex items-center justify-center bg-jelly-red hover:bg-red-600 text-white text-sm font-medium transition-colors"
        title="Leave call"
      >
        ✕
      </button>
    </div>
  )
}
