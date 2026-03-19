# Jellyfish Chat - Product Spec

## Overview
A cozy 2-person video chat app for Rajiv and Ellie, built on Daily.co. Designed as a platform for adding fun interactive elements on top of a clean video call.

**Live:** https://jellyfish-chat.vercel.app
**Repo:** https://github.com/rajivayyangar/jellyfish-chat

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
- Animated via Web Animations API (GPU compositor thread, zero React re-renders)
- Synced between participants via Daily.co app messages
- Multiple creatures can exist simultaneously (aquarium effect)

### Lobby
- Two-button entry: Rajiv and Ellie
- Ellie button triggers pulse/wiggle animation with sparkle burst before joining
- Room URL configurable via env var or manual entry fallback

## Architecture

```
                         Daily.co
                     ┌──────────────┐
                     │  Video Room  │
                     │  (WebRTC)    │
                     └──────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              │                           │
         ┌────┴────┐                 ┌────┴────┐
         │ Rajiv's │                 │ Ellie's │
         │ Browser │                 │ Browser │
         └────┬────┘                 └────┬────┘
              │                           │
    ┌─────────┴─────────┐      ┌─────────┴─────────┐
    │     App.tsx        │      │     App.tsx        │
    │  ┌──────────────┐  │      │  ┌──────────────┐  │
    │  │ useDailyCall │──┼──────┼──│ useDailyCall │  │
    │  │  (join/leave │  │WebRTC│  │  (join/leave │  │
    │  │   mute/cam)  │  │      │  │   mute/cam)  │  │
    │  └──────────────┘  │      │  └──────────────┘  │
    │  ┌──────────────┐  │      │  ┌──────────────┐  │
    │  │useAudioLevels│  │      │  │useAudioLevels│  │
    │  │ (Web Audio   │  │      │  │ (Web Audio   │  │
    │  │  API + RMS)  │  │      │  │  API + RMS)  │  │
    │  └──────────────┘  │      │  └──────────────┘  │
    │  ┌──────────────┐  │ app  │  ┌──────────────┐  │
    │  │ useCreatures │◄─┼──msg─┼─►│ useCreatures │  │
    │  │ (spawn/sync) │  │      │  │ (spawn/sync) │  │
    │  └──────┬───────┘  │      │  └──────┬───────┘  │
    │         │          │      │         │          │
    │  ┌──────┴───────┐  │      │  ┌──────┴───────┐  │
    │  │  Jellyfish   │  │      │  │  Jellyfish   │  │
    │  │  Overlay     │  │      │  │  Overlay     │  │
    │  │ (Web Anim    │  │      │  │ (Web Anim    │  │
    │  │  API, GPU)   │  │      │  │  API, GPU)   │  │
    │  └──────────────┘  │      │  └──────────────┘  │
    └────────────────────┘      └────────────────────┘

    Data flow:
    - Video/audio tracks: WebRTC via Daily.co
    - Interactive state (creatures): Daily app messages (JSON)
    - Speaking detection: local Web Audio API analysis
    - Animations: Web Animations API (compositor thread)
```

## Technical Details

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
- **Audio levels** detected via Web Audio API AnalyserNode with RMS calculation, only triggers re-render when speaking state actually changes
- **Speaking indicator** uses noise gate (0.015) + hold timer (300ms) to prevent flickering
- **Remote audio** handled by creating `<audio>` elements attached to document.body
- **Creature animations** use Web Animations API (`element.animate`) for GPU-composited, zero-re-render drift paths
- **Shared utilities** in `dailyUtils.ts` for audio/video track extraction across hooks

### File Structure
```
src/
  App.tsx                          # Main app with lobby + call screens
  main.tsx                         # Entry point
  index.css                        # Tailwind + base styles + keyframe animations
  hooks/
    dailyUtils.ts                  # Shared track extraction utilities
    useDailyCall.ts                # Daily.co call object, participants, mute/camera
    useAudioLevels.ts              # Web Audio API speaking detection
    useJellyfish.ts                # Creature spawning + app message sync
    useRemoteAudio.ts              # <audio> elements for remote participants
  components/
    VideoTile.tsx                   # Video/avatar rendering with speaking border
    CallControls.tsx                # Mute, camera, creature buttons, leave
    JellyfishOverlay.tsx            # Floating creature animations (Web Animations API)
```

## Future Work
- **High Five / Handshake interactions** - realtime two-person interactions where one person initiates and the other responds, with a shared animation (e.g., high five, fist bump, secret handshake). Uses the app message pattern: initiator sends invite, responder accepts, both see the animation.
- Creature collisions (gentle bump when two creatures drift close)
- More interactive overlay elements (games, reactions, shared drawing)
- Custom Daily.co room creation
- Sound effects
- Device selection (mic/camera picker)
- Screen sharing
