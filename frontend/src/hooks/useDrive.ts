import { useCallback, useEffect, useRef, useState } from 'react'
import { sendAction } from '../lib/api'

export type Dir = 'forward' | 'backward' | 'turn_left' | 'turn_right' | 'stop'

// Імпульсний режим швидкості: [увімк. мс, пауза мс]; 5 = безперервно.
// У робота немає окремого DP швидкості, тож емулюємо ШІМ короткими командами.
const SPEED_DUTY: Record<number, [number, number] | null> = {
  1: [220, 560], 2: [340, 420], 3: [480, 260], 4: [680, 130], 5: null,
}

const KEYMAP: Record<string, Dir> = {
  KeyW: 'forward', KeyS: 'backward', KeyA: 'turn_left', KeyD: 'turn_right',
}

export interface DriveState {
  dir: Dir | null
  speed: number
  kbOn: boolean
  drive: (d: Dir) => void
  setSpeed: (n: number) => void
  setKbOn: (on: boolean) => void
}

export function useDrive(): DriveState {
  const [dir, setDir] = useState<Dir | null>(null)
  const [speed, setSpeed] = useState(3)
  const [kbOn, setKbOn] = useState(false)

  const dirRef = useRef<Dir | null>(null)
  const speedRef = useRef(3)
  const pulse = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { speedRef.current = speed }, [speed])

  const clearPulse = () => {
    if (pulse.current) { clearTimeout(pulse.current); pulse.current = null }
  }

  const drive = useCallback((d: Dir) => {
    if (d === 'stop') {
      clearPulse(); dirRef.current = null; setDir(null); sendAction('drive', 'stop'); return
    }
    if (d === dirRef.current) return
    dirRef.current = d; setDir(d); clearPulse()

    const duty = SPEED_DUTY[speedRef.current]
    if (!duty) { sendAction('drive', d); return } // швидкість 5 — без імпульсів

    const [onMs, offMs] = duty
    const cycle = () => {
      if (dirRef.current !== d) return
      sendAction('drive', d)
      pulse.current = setTimeout(() => {
        if (dirRef.current !== d) return
        sendAction('drive', 'stop')
        pulse.current = setTimeout(cycle, offMs)
      }, onMs)
    }
    cycle()
  }, [])

  useEffect(() => {
    if (!kbOn) return
    const down = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || '').toLowerCase()
      if (tag === 'input' || tag === 'textarea') return
      if (e.code === 'Space') { e.preventDefault(); drive('stop'); return }
      const d = KEYMAP[e.code]
      if (d) { e.preventDefault(); if (!e.repeat) drive(d) }
    }
    const up = (e: KeyboardEvent) => {
      const d = KEYMAP[e.code]
      if (d && dirRef.current === d) { e.preventDefault(); drive('stop') }
    }
    const blur = () => { if (dirRef.current) drive('stop') }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
    }
  }, [kbOn, drive])

  useEffect(() => () => clearPulse(), [])

  return { dir, speed, kbOn, drive, setSpeed, setKbOn }
}
