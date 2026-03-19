# Jellyfish Chat - Product Spec

## Overview
A cozy 2-person video chat app for Rajiv and Ellie, built on Daily.co. Designed as a platform for adding fun interactive elements on top of a clean video call.

**Live:** https://jellyfish-chat.vercel.app

## Core Features

### Video Call
- Daily.co-powered 1:1 video chat
- PIP layout: remote participant fullscreen, local user in small corner overlay
- Mute/unmute microphone
- Camera on/off toggle
- White speaking indicator border (Web Audio API-based, with noise gate and 300ms hold)
- Remote audio playback via dynamically created `<audio>` elements

### Sea Creatures
Interactive emoji buttons that spawn floating creatures visible to both participants:

| Creature | Emoji | Animation |
|----------|-------|-----------|
| Jellyfish | 🪼 | Gentle bob with rotation |
| Seahorse | 🦑 | Gentle bob with rotation |
| Fish | 🐠 | Side-to-side swim |

**Behavior:**
- Spawn near bottom of screen at random x position
- Drift upward in 3-5 segments, each with random direction and duration
- Grow ~50% larger over first 3 seconds (scale 0.67 -> 1.0)
- Fade out during final segment after 10-15 seconds total
- Synced between participants via Daily.co app messages
- Multiple creatures can exist simultaneously (aquarium effect)

### Lobby
- Name entry with session persistence
- Room URL configurable via env var or manual entry
- Jellyfish branding

## Technical Architecture

### Stack
- Vite + React 18 + TypeScript
- Tailwind CSS
- @daily-co/daily-js
- Deployed on Vercel

### Color Palette
| Name | Hex | Usage |
|------|-----|-------|
| Dark Brown | #372020 | Background |
| Red | #FF2E2E | Alerts, mute indicator, leave button |
| Light Blue | #9FBFFF | Accents, interactive elements |
| Yellow | #FFEDA1 | Headings, highlights |

### Key Patterns
- **App messages** (`callObject.sendAppMessage`) sync interactive state between participants
- **No React StrictMode** due to Daily.co singleton constraint
- **Audio levels** detected via Web Audio API AnalyserNode with RMS calculation
- **Speaking indicator** uses noise gate (0.015) + hold timer (300ms) to prevent flickering
- **Remote audio** handled by creating `<audio>` elements attached to document.body

### File Structure
```
src/
  App.tsx                          # Main app with lobby + call screens
  main.tsx                         # Entry point
  index.css                        # Tailwind + base styles
  hooks/
    useDailyCall.ts                # Daily.co call object, participants, mute/camera
    useAudioLevels.ts              # Web Audio API speaking detection
    useJellyfish.ts                # Creature spawning + app message sync
    useRemoteAudio.ts              # <audio> elements for remote participants
  components/
    VideoTile.tsx                   # Video/avatar rendering with speaking border
    CallControls.tsx                # Mute, camera, creature buttons, leave
    JellyfishOverlay.tsx            # Floating creature animations
```

## Future Ideas
- Creature collisions (gentle bump when two creatures drift close)
- More interactive elements (games, reactions, shared drawing)
- Custom Daily.co room creation
- Sound effects
