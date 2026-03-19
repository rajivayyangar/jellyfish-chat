/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DAILY_ROOM_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
