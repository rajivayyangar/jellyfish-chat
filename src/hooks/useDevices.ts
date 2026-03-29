import { useEffect, useState, useCallback } from 'react'
import { DailyCall } from '@daily-co/daily-js'

export interface DeviceInfo {
  deviceId: string
  label: string
}

export interface DeviceState {
  mics: DeviceInfo[]
  cameras: DeviceInfo[]
  speakers: DeviceInfo[]
  selectedMic: string
  selectedCamera: string
  selectedSpeaker: string
  setMic: (deviceId: string) => void
  setCamera: (deviceId: string) => void
  setSpeaker: (deviceId: string) => void
}

export function useDevices(callObject: DailyCall | null): DeviceState {
  const [mics, setMics] = useState<DeviceInfo[]>([])
  const [cameras, setCameras] = useState<DeviceInfo[]>([])
  const [speakers, setSpeakers] = useState<DeviceInfo[]>([])
  const [selectedMic, setSelectedMic] = useState('')
  const [selectedCamera, setSelectedCamera] = useState('')
  const [selectedSpeaker, setSelectedSpeaker] = useState('')

  const refreshDevices = useCallback(async () => {
    if (!callObject) return
    try {
      const { devices } = await callObject.enumerateDevices()
      setMics(
        devices
          .filter((d) => d.kind === 'audioinput')
          .map((d) => ({ deviceId: d.deviceId, label: d.label || `Mic ${d.deviceId.slice(0, 4)}` })),
      )
      setCameras(
        devices
          .filter((d) => d.kind === 'videoinput')
          .map((d) => ({ deviceId: d.deviceId, label: d.label || `Camera ${d.deviceId.slice(0, 4)}` })),
      )
      setSpeakers(
        devices
          .filter((d) => d.kind === 'audiooutput')
          .map((d) => ({ deviceId: d.deviceId, label: d.label || `Speaker ${d.deviceId.slice(0, 4)}` })),
      )

      const current = await callObject.getInputDevices()
      if ('deviceId' in current.mic) setSelectedMic(current.mic.deviceId)
      if ('deviceId' in current.camera) setSelectedCamera(current.camera.deviceId)
      if ('deviceId' in current.speaker) setSelectedSpeaker(current.speaker.deviceId)
    } catch {
      // call object may be destroyed
    }
  }, [callObject])

  useEffect(() => {
    if (!callObject) return
    refreshDevices()
    callObject.on('joined-meeting', refreshDevices)
    return () => {
      callObject.off('joined-meeting', refreshDevices)
    }
  }, [callObject, refreshDevices])

  const setMic = useCallback(
    (deviceId: string) => {
      callObject?.setInputDevicesAsync({ audioDeviceId: deviceId })
      setSelectedMic(deviceId)
    },
    [callObject],
  )

  const setCamera = useCallback(
    (deviceId: string) => {
      callObject?.setInputDevicesAsync({ videoDeviceId: deviceId })
      setSelectedCamera(deviceId)
    },
    [callObject],
  )

  const setSpeaker = useCallback(
    (deviceId: string) => {
      callObject?.setOutputDeviceAsync({ outputDeviceId: deviceId })
      setSelectedSpeaker(deviceId)
    },
    [callObject],
  )

  return {
    mics,
    cameras,
    speakers,
    selectedMic,
    selectedCamera,
    selectedSpeaker,
    setMic,
    setCamera,
    setSpeaker,
  }
}
