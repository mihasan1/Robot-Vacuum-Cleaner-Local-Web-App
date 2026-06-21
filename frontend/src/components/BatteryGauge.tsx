import { useId } from 'react'
import { Zap } from 'lucide-react'
import { useApp } from '../app-context'
import { statusMeta, batteryColor, CLEANING_STATES } from '../lib/meta'
import { Card } from './ui'
import { useT } from '../i18n'

export function BatteryGauge() {
  const { status } = useApp()
  const t = useT()
  const b = status?.battery ?? null
  const pct = b ?? 0
  const sm = statusMeta(status?.status)
  const color = batteryColor(b)
  const charging = status?.status === 'charging'
  const cleaning = CLEANING_STATES.includes(status?.status ?? '')
  const gid = useId().replace(/:/g, '')
  const progress = (Math.max(0, Math.min(100, pct)) * 0.75).toFixed(2)

  return (
    <Card className="p-6 h-full flex flex-col items-center justify-center">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint self-start mb-1">{t('gauge.label')}</div>

      <div className="relative w-[208px] h-[208px] mt-2">
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <circle
            cx="60" cy="60" r="50" fill="none" stroke="var(--color-surface-3)" strokeWidth="11"
            pathLength={100} strokeDasharray="75 100" strokeLinecap="round" transform="rotate(135 60 60)"
          />
          <circle
            cx="60" cy="60" r="50" fill="none" stroke={`url(#g-${gid})`} strokeWidth="11"
            pathLength={100} strokeDasharray={`${progress} 100`} strokeLinecap="round" transform="rotate(135 60 60)"
            style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.22,1,0.36,1)' }}
          />
          <defs>
            <linearGradient id={`g-${gid}`} x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
              <stop stopColor={color} />
              <stop offset="1" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="flex items-end justify-center gap-0.5">
              <span className="text-5xl font-semibold tracking-tight tabular-nums">{b == null ? '—' : b}</span>
              <span className="text-2xl text-muted mb-1">%</span>
            </div>
            <div className="mt-1 inline-flex items-center gap-1.5 text-sm" style={{ color }}>
              {charging && <Zap size={14} className="pulse-dot" />}
              <sm.Icon size={14} />
              <span className="text-text-dim">{t(sm.key)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 w-full grid grid-cols-3 gap-2 text-center">
        {[
          { l: t('gauge.mode'), v: cleaning ? t('gauge.active') : t('gauge.idle') },
          { l: t('gauge.session'), v: `${status?.clean_area ?? 0} ${t('unit.area')}` },
          { l: t('gauge.time'), v: `${status?.clean_time ?? 0} ${t('unit.min')}` },
        ].map((x) => (
          <div key={x.l} className="rounded-xl border border-line bg-surface-2/40 py-2.5">
            <div className="text-[13px] font-semibold truncate px-1">{x.v}</div>
            <div className="text-[11px] text-muted mt-0.5">{x.l}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}
