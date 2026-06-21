import { Route, Maximize2, Timer } from 'lucide-react'
import { useApp } from '../app-context'
import { Card } from '../components/ui'
import { TONES, type IconType } from '../lib/meta'
import { SessionChart } from '../components/SessionChart'
import { MaintenanceRadial } from '../components/MaintenanceRadial'
import { useT } from '../i18n'

function Tile({ Icon, tone, value, label }: { Icon: IconType; tone: string; value: string; label: string }) {
  return (
    <Card className="p-5">
      <span className="grid place-items-center h-11 w-11 rounded-2xl" style={{ background: tone + '1f', color: tone }}>
        <Icon size={20} />
      </span>
      <div className="mt-4 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="text-[13px] text-muted mt-0.5">{label}</div>
    </Card>
  )
}

export function Statistics() {
  const { status } = useApp()
  const t = useT()
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Tile Icon={Route} tone={TONES.violet} value={`${status?.total_count ?? 0}`} label={t('stats.totalRuns')} />
        <Tile Icon={Maximize2} tone={TONES.cyan} value={`${status?.total_area ?? 0} ${t('unit.area')}`} label={t('stats.totalArea')} />
        <Tile Icon={Timer} tone={TONES.green} value={`${status?.total_time ?? 0} ${t('unit.hours')}`} label={t('stats.totalHours')} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8"><SessionChart /></div>
        <div className="lg:col-span-4"><MaintenanceRadial /></div>
      </div>
    </div>
  )
}
