import { useEffect, useRef, useState } from 'react'
import { Volume2, Bell, Moon } from 'lucide-react'
import { useApp } from '../app-context'
import { TONES } from '../lib/meta'
import { Card, CardHead } from './ui'
import { useT } from '../i18n'

const DND = [
  { value: 'off', key: 'sound.on', Icon: Bell },
  { value: 'on', key: 'sound.dnd', Icon: Moon },
]

export function SoundCard() {
  const { status, act } = useApp()
  const t = useT()
  const serverVol = status?.volume ?? 0
  const [vol, setVol] = useState(serverVol)
  const dragging = useRef(false)

  useEffect(() => {
    if (!dragging.current) setVol(serverVol)
  }, [serverVol])

  const disturb = status?.disturb ? 'on' : 'off'

  return (
    <Card className="p-5 h-full">
      <CardHead icon={Volume2} title={t('sound.title')} desc={t('sound.desc')} tone={TONES.amber} />

      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted">{t('sound.volume')}</span>
        <span className="text-sm font-semibold tabular-nums">{vol}%</span>
      </div>
      <input
        type="range" min={0} max={100} step={1} value={vol}
        style={{ ['--_p' as string]: vol + '%' }}
        onPointerDown={() => { dragging.current = true }}
        onInput={(e) => setVol(Number((e.target as HTMLInputElement).value))}
        onChange={(e) => { dragging.current = false; act('volume', Number(e.target.value)) }}
      />

      <div className="mt-5 grid grid-cols-2 gap-2">
        {DND.map(({ value, key, Icon }) => {
          const on = value === disturb
          return (
            <button
              key={value}
              onClick={() => act('disturb', value === 'on' ? 'true' : 'false')}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 h-11 text-[13px] font-medium transition active:scale-[.98] ${
                on ? 'border-primary/55 bg-primary/12 text-text' : 'border-line bg-surface-2/40 text-muted hover:border-line-2'
              }`}
            >
              <Icon size={16} className={on ? 'text-primary-2' : ''} />
              {t(key)}
            </button>
          )
        })}
      </div>
    </Card>
  )
}
