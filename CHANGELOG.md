# Changelog

## 2026-03-18

### Added
- Initial release of Jellyfish Chat
- Daily.co 1:1 video call with PIP layout
- Mute/unmute and camera toggle controls
- Jellyfish emoji button spawning floating animated jellyfish
- Seahorse and tropical fish emoji buttons
- Creatures grow ~50% larger over first 3 seconds
- Creature sync between participants via Daily app messages
- White speaking indicator border on video tiles (Web Audio API)
- Remote audio playback via dynamic `<audio>` elements
- Mobile responsive design
- Color palette: #372020, #FF2E2E, #9FBFFF, #FFEDA1
- Deployed to https://jellyfish-chat.vercel.app
- GitHub repo: https://github.com/rajivayyangar/jellyfish-chat

### Changed
- Lobby: replaced name input with Rajiv/Ellie buttons
- Ellie button triggers pulse/wiggle animation + sparkle burst before joining
- Creature animations migrated from CSS transitions to Web Animations API (GPU compositor, zero re-renders)
- Speaking detection only triggers re-renders when state actually changes (was ~60/sec)
- Reuses single Uint8Array buffer for audio analysis instead of allocating per-frame
- Removed redundant track-started/track-stopped event listeners from useDailyCall
- VideoTile skips MediaStream creation when track ID unchanged
- Moved static @keyframes to index.css (was injected via `<style>` on every render)
- Extracted shared dailyUtils.ts for audio/video track extraction
- CallControls derives emoji from shared CREATURE_EMOJI map
- Fixed broken room URL input (was uncontrolled)
- Removed dead code (unused handleLeave wrapper, sendAppMessage export, wrapper div)
