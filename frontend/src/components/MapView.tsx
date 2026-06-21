import { useCallback, useEffect, useRef, useState } from 'react'
import { Map as MapIcon, RotateCw, Eraser, Loader2, CloudOff } from 'lucide-react'
import { useApp } from '../app-context'
import { mapUrl } from '../lib/api'
import { Card, CardHead, Button } from './ui'
import { useT } from '../i18n'

type MapState = 'idle' | 'loading' | 'image' | 'subscribe' | 'error'

export function MapView() {
  const { act } = useApp()
  const t = useT()
  const [state, setState] = useState<MapState>('idle')
  const [url, setUrl] = useState<string>()
  const [err, setErr] = useState<string>()
  const [auto, setAuto] = useState(false)
  const [stamp, setStamp] = useState<string>()
  const urlRef = useRef<string>(undefined)

  const load = useCallback(async () => {
    setState((s) => (s === 'image' ? 'image' : 'loading'))
    try {
      const r = await fetch(mapUrl())
      const ct = r.headers.get('Content-Type') || ''
      if (ct.startsWith('image')) {
        const blob = await r.blob()
        const u = URL.createObjectURL(blob)
        if (urlRef.current) URL.revokeObjectURL(urlRef.current)
        urlRef.current = u
        setUrl(u)
        setStamp(new Date().toLocaleTimeString())
        setState('image')
      } else {
        const j = await r.json()
        if (j.error === 'SUBSCRIBE') setState('subscribe')
        else { setErr(j.error || 'unknown error'); setState('error') }
      }
    } catch {
      setErr(t('map.connError'))
      setState('error')
    }
  }, [t])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    if (!auto) return
    const id = setInterval(load, 10000)
    return () => clearInterval(id)
  }, [auto, load])
  useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current) }, [])

  return (
    <Card className="p-5 sm:p-6">
      <CardHead
        icon={MapIcon} title={t('map.title')} desc={t('map.desc')} tone="#22d3ee"
        action={
          <label className="flex items-center gap-2 text-xs text-muted cursor-pointer select-none">
            <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} className="accent-[#7c5cff] h-4 w-4" />
            {t('map.auto')}
          </label>
        }
      />

      <div className="flex flex-wrap items-center gap-2.5 mb-4">
        <Button variant="primary" icon={RotateCw} onClick={load}>{t('map.refresh')}</Button>
        <Button
          variant="danger" icon={Eraser}
          onClick={() => { if (confirm(t('maint.mapConfirm'))) { act('reset_map', undefined, 'maint.mapDone'); setTimeout(load, 1500) } }}
        >
          {t('map.reset')}
        </Button>
        {stamp && state === 'image' && <span className="text-xs text-faint font-mono ml-auto">{t('map.updated', { time: stamp })}</span>}
      </div>

      <div className="rounded-2xl border border-line bg-bg-2 min-h-[360px] grid place-items-center p-4 overflow-auto">
        {state === 'loading' && (
          <div className="flex flex-col items-center gap-3 text-muted">
            <Loader2 size={26} className="animate-spin text-primary-2" />
            <span className="text-sm">{t('map.loading')}</span>
          </div>
        )}
        {state === 'image' && url && (
          <img src={url} alt={t('map.title')} className="max-w-full rounded-xl border border-line" style={{ imageRendering: 'pixelated' }} />
        )}
        {state === 'subscribe' && <SubscribeHint />}
        {state === 'error' && (
          <div className="flex flex-col items-center gap-3 text-center max-w-md">
            <CloudOff size={26} className="text-danger" />
            <div className="text-sm text-text-dim">{t('map.error')}</div>
            <div className="text-xs text-muted break-words">{err}</div>
          </div>
        )}
      </div>
    </Card>
  )
}

function SubscribeHint() {
  const t = useT()
  const steps = ['map.sub.step1', 'map.sub.step2', 'map.sub.step3', 'map.sub.step4']
  return (
    <div className="max-w-xl text-left">
      <h4 className="text-base font-semibold mb-1.5">{t('map.sub.title')}</h4>
      <p className="text-sm text-muted mb-4">{t('map.sub.intro')}</p>
      <ol className="space-y-2.5">
        {steps.map((key, i) => (
          <li key={key} className="flex gap-3 text-sm">
            <span className="grid place-items-center h-6 w-6 shrink-0 rounded-full bg-primary/15 text-primary-2 text-xs font-semibold">{i + 1}</span>
            <span className="text-text-dim pt-0.5">{t(key)}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
