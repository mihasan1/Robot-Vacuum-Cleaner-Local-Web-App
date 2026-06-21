import { Battery, BatteryCharging, Ruler, Clock } from 'lucide-react'
import type { ReactNode } from 'react'
import { useApp } from '../app-context'
import { statusMeta, batteryColor, TONES, type IconType } from '../lib/meta'
import { Card } from './ui'
import { useT } from '../i18n'

function StatCard({
  Icon, tone, value, label, sub, small,
}: {
  Icon: IconType
  tone: string
  value: ReactNode
  label: string
  sub?: string
  small?: boolean
}) {
  return (
    <Card className="p-4 sm:p-5 animate-in">
      <div className="flex items-start justify-between">
        <span className="grid place-items-center h-11 w-11 rounded-2xl shrink-0" style={{ background: tone + '1f', color: tone }}>
          <Icon size={20} />
        </span>
        {sub && <span className="text-[11px] text-muted text-right max-w-[55%] truncate">{sub}</span>}
      </div>
      <div className={`mt-4 font-semibold tracking-tight truncate ${small ? 'text-xl' : 'text-2xl'}`}>{value}</div>
      <div className="text-[13px] text-muted mt-0.5">{label}</div>
    </Card>
  )
}

export function StatCards() {
  const { status } = useApp()
  const t = useT()
  const b = status?.battery ?? null
  const sm = statusMeta(status?.status)
  const charging = status?.status === 'charging'
  const fault = status?.fault ?? 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      <StatCard
        Icon={charging ? BatteryCharging : Battery}
        tone={batteryColor(b)}
        value={b == null ? '—' : b + '%'}
        label={t('stat.battery')}
        sub={charging ? t('stat.charging') : undefined}
      />
      <StatCard
        Icon={sm.Icon}
        tone={TONES[sm.tone]}
        value={t(sm.key)}
        label={t('stat.state')}
        sub={fault ? t('stat.error', { n: fault }) : t('stat.noErrors')}
        small
      />
      <StatCard
        Icon={Ruler}
        tone={TONES.violet}
        value={`${status?.clean_area ?? 0} ${t('unit.area')}`}
        label={t('stat.sessionArea')}
      />
      <StatCard
        Icon={Clock}
        tone={TONES.cyan}
        value={`${status?.clean_time ?? 0} ${t('unit.min')}`}
        label={t('stat.sessionTime')}
      />
    </div>
  )
}
