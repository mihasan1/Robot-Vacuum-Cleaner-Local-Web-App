import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchStatus } from '../lib/api'
import type { RobotStatus, Sample } from '../lib/types'

const POLL_MS = 5000
const HISTORY_MAX = 120

export interface StatusState {
  status: RobotStatus | null
  online: boolean | null
  lastUpdated: number | null
  history: Sample[]
  refresh: () => void
}

export function useStatus(): StatusState {
  const [status, setStatus] = useState<RobotStatus | null>(null)
  const [online, setOnline] = useState<boolean | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const [history, setHistory] = useState<Sample[]>([])
  const busy = useRef(false)

  const refresh = useCallback(async () => {
    if (busy.current) return
    busy.current = true
    const ctrl = new AbortController()
    const to = setTimeout(() => ctrl.abort(), 8000)
    try {
      const s = await fetchStatus(ctrl.signal)
      setStatus(s)
      setOnline(!!s.ok)
      setLastUpdated(Date.now())
      if (s.ok) {
        setHistory((h) => {
          const next = [...h, { t: Date.now(), battery: s.battery ?? null, area: s.clean_area ?? 0 }]
          return next.length > HISTORY_MAX ? next.slice(next.length - HISTORY_MAX) : next
        })
      }
    } catch {
      setOnline(false)
    } finally {
      clearTimeout(to)
      busy.current = false
    }
  }, [])

  useEffect(() => {
    refresh()
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') refresh()
    }, POLL_MS)
    const onVis = () => { if (document.visibilityState === 'visible') refresh() }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [refresh])

  return { status, online, lastUpdated, history, refresh }
}
