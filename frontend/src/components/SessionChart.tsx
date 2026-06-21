import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Activity } from 'lucide-react'
import { useApp } from '../app-context'
import { Card, CardHead } from './ui'
import { useI18n } from '../i18n'

export function SessionChart() {
  const { history } = useApp()
  const { t, lang } = useI18n()
  const data = history.filter((s) => s.battery != null)
  const locale = lang === 'uk' ? 'uk-UA' : 'en-GB'
  const fmtTime = (ms: number) =>
    new Date(ms).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  const tip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { t: number; battery: number | null; area: number } }> }) => {
    if (!active || !payload?.length) return null
    const p = payload[0].payload
    return (
      <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-xl">
        <div className="text-muted font-mono">{fmtTime(p.t)}</div>
        <div className="font-semibold mt-1">{t('chart.charge')}: {p.battery ?? '—'}%</div>
        <div style={{ color: '#22d3ee' }}>{t('chart.area')}: {p.area} {t('unit.area')}</div>
      </div>
    )
  }

  return (
    <Card className="p-5 sm:p-6 h-full">
      <CardHead
        icon={Activity} title={t('chart.title')} desc={t('chart.desc')} tone="#9d7bff"
        action={<span className="text-xs text-muted tabular-nums">{t('chart.points', { n: data.length })}</span>}
      />
      {data.length < 2 ? (
        <div className="h-[240px] grid place-items-center text-center">
          <div>
            <div className="text-sm text-muted">{t('chart.collecting')}</div>
            <div className="text-xs text-faint mt-1">{t('chart.collectingHint')}</div>
          </div>
        </div>
      ) : (
        <div className="h-[240px] -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="batFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9d7bff" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#9d7bff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e2740" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="t" tickFormatter={fmtTime} tick={{ fill: '#5b6680', fontSize: 11 }}
                axisLine={false} tickLine={false} minTickGap={44}
              />
              <YAxis
                domain={[0, 100]} width={30} ticks={[0, 50, 100]} tick={{ fill: '#5b6680', fontSize: 11 }}
                axisLine={false} tickLine={false}
              />
              <Tooltip content={tip} cursor={{ stroke: '#2a3556', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="battery" stroke="#9d7bff" strokeWidth={2.5} fill="url(#batFill)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
