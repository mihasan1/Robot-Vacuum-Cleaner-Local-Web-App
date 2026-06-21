import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { Gauge } from 'lucide-react'
import { useApp } from '../app-context'
import { MAINTENANCE, formatLife, TONES } from '../lib/meta'
import type { RobotStatus } from '../lib/types'
import { Card, CardHead } from './ui'
import { useT } from '../i18n'

export function MaintenanceRadial() {
  const { status } = useApp()
  const t = useT()
  const data = MAINTENANCE.map((it) => {
    const { pct, text } = formatLife(status ? (status[it.field as keyof RobotStatus] as number | null) : null, it.maxHours, t)
    return { name: t(it.labelKey), value: pct, fill: TONES[it.tone], text }
  })

  return (
    <Card className="p-5 sm:p-6 h-full">
      <CardHead icon={Gauge} title={t('maint.radial.title')} desc={t('maint.radial.desc')} tone="#34d399" />
      <div className="h-[208px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="34%" outerRadius="100%" data={data} startAngle={90} endAngle={-270} barSize={12}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar background={{ fill: '#1b2335' }} dataKey="value" cornerRadius={8} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2.5">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2 text-xs min-w-0">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: d.fill }} />
            <span className="text-muted truncate">{d.name}</span>
            <span className="ml-auto font-semibold tabular-nums whitespace-nowrap">{d.text}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
