import { Gamepad2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Square, Keyboard } from 'lucide-react'
import { useDrive, type Dir } from '../hooks/useDrive'
import type { IconType } from '../lib/meta'
import { Card, CardHead } from './ui'
import { useT } from '../i18n'

interface Pad { d: Dir; Icon: IconType; key: string }
const GRID: (Pad | null)[] = [
  null, { d: 'forward', Icon: ArrowUp, key: 'W' }, null,
  { d: 'turn_left', Icon: ArrowLeft, key: 'A' }, { d: 'stop', Icon: Square, key: '␣' }, { d: 'turn_right', Icon: ArrowRight, key: 'D' },
  null, { d: 'backward', Icon: ArrowDown, key: 'S' }, null,
]

export function ManualDrive() {
  const { dir, speed, kbOn, drive, setSpeed, setKbOn } = useDrive()
  const t = useT()

  const hold = (d: Dir) =>
    d === 'stop'
      ? { onClick: () => drive('stop') }
      : {
          onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); drive(d) },
          onPointerUp: () => drive('stop'),
          onPointerLeave: () => { if (dir === d) drive('stop') },
          onPointerCancel: () => drive('stop'),
        }

  return (
    <Card className="p-5 sm:p-6">
      <CardHead icon={Gamepad2} title={t('drive.title')} desc={t('drive.desc')} tone="#f472b6" />

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-center lg:items-start">
        <div className="grid grid-cols-3 gap-2.5 w-[260px] shrink-0" style={{ touchAction: 'none' }}>
          {GRID.map((cell, i) => {
            if (!cell) return <span key={i} />
            const { d, Icon, key } = cell
            const stop = d === 'stop'
            const active = dir === d && !stop
            return (
              <button
                key={i}
                {...hold(d)}
                className={`relative aspect-square rounded-2xl border flex flex-col items-center justify-center gap-1 select-none transition active:scale-95 ${
                  stop
                    ? 'border-[#3a2233] text-[#ff9b9b] hover:border-danger hover:text-danger bg-surface-2/40'
                    : active
                      ? 'border-primary text-white bg-[linear-gradient(180deg,#8b6dff,#6d4bf0)] shadow-[0_10px_24px_-12px_rgba(124,92,255,0.95)]'
                      : 'border-line text-text-dim bg-surface-2/50 hover:border-line-2'
                }`}
              >
                <Icon size={22} />
                <span className={`text-[10px] font-semibold ${active ? 'text-white/85' : 'text-faint'}`}>{key}</span>
              </button>
            )
          })}
        </div>

        <div className="flex-1 w-full min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted">{t('drive.speed')}</span>
            <span className="text-sm font-semibold tabular-nums">{speed}/5</span>
          </div>
          <input
            type="range" min={1} max={5} step={1} value={speed}
            style={{ ['--_p' as string]: ((speed - 1) / 4) * 100 + '%' }}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <p className="text-xs text-muted mt-2 leading-relaxed">{t('drive.speedHint')}</p>

          <button
            onClick={() => setKbOn(!kbOn)}
            className={`mt-5 w-full flex items-center gap-3 rounded-xl border px-4 h-12 text-sm font-medium transition ${
              kbOn ? 'border-primary/55 bg-primary/12 text-text' : 'border-line bg-surface-2/40 text-muted hover:border-line-2'
            }`}
          >
            <Keyboard size={18} className={kbOn ? 'text-primary-2' : ''} />
            <span>{kbOn ? t('drive.kbOn') : t('drive.kbOff')}</span>
            <span className="ml-auto flex items-center gap-1">
              {['W', 'A', 'S', 'D'].map((k) => (
                <kbd
                  key={k}
                  className={`grid place-items-center h-6 w-6 rounded-md text-[11px] font-semibold border ${
                    kbOn ? 'border-primary/40 text-primary-2 bg-primary/10' : 'border-line text-faint'
                  }`}
                >
                  {k}
                </kbd>
              ))}
            </span>
          </button>
          {kbOn && <p className="text-xs text-muted mt-2">{t('drive.kbHint')}</p>}
        </div>
      </div>
    </Card>
  )
}
