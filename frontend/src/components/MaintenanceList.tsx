import { Wrench, RotateCcw } from 'lucide-react'
import { useApp } from '../app-context'
import { MAINTENANCE, formatLife, TONES } from '../lib/meta'
import type { RobotStatus } from '../lib/types'
import { Card, CardHead, Progress, Button } from './ui'
import { useT } from '../i18n'

export function MaintenanceList() {
  const { status, act } = useApp()
  const t = useT()

  const reset = (labelKey: string, action: string) => {
    if (confirm(t('maint.resetConfirm', { name: t(labelKey) }))) {
      act(action, undefined, 'maint.resetDone')
    }
  }

  return (
    <Card className="p-5 sm:p-6">
      <CardHead icon={Wrench} title={t('maint.list.title')} desc={t('maint.list.desc')} tone="#22d3ee" />
      <div className="space-y-4">
        {MAINTENANCE.map((it) => {
          const { pct, text } = formatLife(status ? (status[it.field as keyof RobotStatus] as number | null) : null, it.maxHours, t)
          return (
            <div key={it.field}>
              <div className="flex items-center gap-3 mb-2">
                <span className="grid place-items-center h-9 w-9 rounded-xl shrink-0" style={{ background: TONES[it.tone] + '1f', color: TONES[it.tone] }}>
                  <it.Icon size={17} />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-medium">{t(it.labelKey)}</div>
                  <div className="text-xs text-muted">{t('maint.remaining')} · {text}</div>
                </div>
                <Button size="sm" variant="danger" icon={RotateCcw} className="ml-auto" onClick={() => reset(it.labelKey, it.reset)}>
                  {t('maint.reset')}
                </Button>
              </div>
              <Progress value={pct} color={TONES[it.tone]} />
            </div>
          )
        })}
      </div>
    </Card>
  )
}
