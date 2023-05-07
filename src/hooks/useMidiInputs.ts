import { useState, useEffect, useReducer, useMemo } from 'react'
import { getMidiInputs } from '@/features/midi'
import { debug } from 'console'

interface MidiInputReturn {
  inputs: WebMidi.MIDIInputMap | null
  loading: boolean
  refresh: () => void
}

export default function useMidiInputs(): MidiInputReturn {
  const [midiMap, setMidiMap] = useState<WebMidi.MIDIInputMap | null>(null)
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0)
  useEffect(() => {
    setMidiMap(null)
    getMidiInputs()
      .then(setMidiMap)
      .catch(() => setMidiMap(new Map()))
  }, [ignored])

  return useMemo(
    () => ({
      inputs: midiMap,
      loading: midiMap === null,
      refresh: forceUpdate,
    }),
    [midiMap],
  )
}
