import { Cpu, Info, SquareTerminal, Globe } from 'lucide-react'
import { useApp } from '../app-context'
import { Card, CardHead, Row } from '../components/ui'
import { TONES } from '../lib/meta'
import { LangToggle } from '../components/LangToggle'
import { useI18n } from '../i18n'

export function Settings() {
  const { status, online, lastUpdated } = useApp()
  const { t, lang } = useI18n()
  const raw = status?.raw ?? {}
  const updated = lastUpdated ? new Date(lastUpdated).toLocaleString(lang === 'uk' ? 'uk-UA' : 'en-GB') : '—'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div className="lg:col-span-6 space-y-5">
        <Card className="p-5 sm:p-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="grid place-items-center h-9 w-9 rounded-xl shrink-0" style={{ background: TONES.violet + '1f', color: TONES.violet }}>
              <Globe size={18} />
            </span>
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold truncate">{t('settings.language')}</h3>
              <p className="text-xs text-muted truncate">{t('settings.languageDesc')}</p>
            </div>
          </div>
          <LangToggle />
        </Card>

        <Card className="p-5 sm:p-6">
          <CardHead icon={Cpu} title={t('settings.device')} desc={t('settings.deviceDesc')} tone="#9d7bff" />
          <Row label={t('settings.model')}>{t('settings.modelValue')}</Row>
          <Row label={t('settings.protocol')}>{t('settings.protocolValue')}</Row>
          <Row label={t('settings.channel')}>{t('settings.channelValue')}</Row>
          <Row label={t('settings.state')}>
            <span style={{ color: online ? TONES.green : online === false ? TONES.danger : TONES.muted }}>
              {online ? t('common.online') : online === false ? t('common.offline') : '…'}
            </span>
          </Row>
          <Row label={t('settings.lastUpdate')}>{updated}</Row>
          <Row label={t('settings.pollInterval')}>{t('settings.pollValue')}</Row>
        </Card>

        <Card className="p-5 sm:p-6">
          <CardHead icon={Info} title={t('settings.about')} tone="#22d3ee" />
          <p className="text-sm text-muted leading-relaxed">{t('settings.aboutText')}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {['React', 'Vite', 'Recharts', 'Tailwind', 'lucide', 'tinytuya'].map((x) => (
              <span key={x} className="text-xs px-2.5 py-1 rounded-full border border-line bg-surface-2/50 text-muted">{x}</span>
            ))}
          </div>
          <p className="text-xs text-faint mt-4">
            {t('settings.secretsNote').split('{env}').map((part, i) => (
              <span key={i}>
                {i > 0 && <code className="font-mono text-primary-2">.env</code>}
                {part}
              </span>
            ))}
          </p>
        </Card>
      </div>

      <div className="lg:col-span-6">
        <Card className="p-5 sm:p-6 h-full">
          <CardHead
            icon={SquareTerminal} title={t('settings.diag')} desc={t('settings.diagDesc')} tone="#34d399"
            action={<span className="text-xs text-muted tabular-nums">{Object.keys(raw).length} DP</span>}
          />
          {Object.keys(raw).length === 0 ? (
            <div className="text-sm text-muted">{t('settings.noData')}</div>
          ) : (
            <div className="rounded-xl border border-line bg-bg-2 p-3 max-h-[460px] overflow-auto font-mono text-xs space-y-1">
              {Object.entries(raw).map(([k, v]) => (
                <div key={k} className="flex gap-3">
                  <span className="text-faint w-9 shrink-0 text-right">{k}</span>
                  <span className="text-text-dim break-all">{String(v)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
