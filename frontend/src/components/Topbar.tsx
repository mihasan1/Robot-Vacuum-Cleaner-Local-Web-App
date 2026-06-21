import { Play, House, RotateCw } from 'lucide-react'
import { useApp } from '../app-context'
import type { ViewId } from '../lib/types'
import { TONES } from '../lib/meta'
import { Button, IconButton } from './ui'
import { LogoMark } from './Logo'
import { LangToggle } from './LangToggle'
import { useI18n } from '../i18n'

export function Topbar({ view }: { view: ViewId }) {
  const { online, lastUpdated, refresh, act } = useApp()
  const { t, lang } = useI18n()
  const updated = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString(lang === 'uk' ? 'uk-UA' : 'en-GB', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      })
    : '—'

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-line bg-bg/80 backdrop-blur-xl">
      <div className="h-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3">
        <div className="lg:hidden flex items-center gap-2.5">
          <LogoMark size={32} />
          <span className="font-semibold">RoboVac</span>
        </div>

        <div className="hidden lg:block min-w-0">
          <h1 className="text-[15px] font-semibold truncate">{t('nav.' + view)}</h1>
          <p className="text-xs text-muted truncate">{t('topbar.subtitle')}</p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <LangToggle />
          <div className="hidden sm:flex items-center gap-2 h-9 pl-2.5 pr-3 rounded-full border border-line bg-surface-2/60">
            <span
              className={online ? 'pulse-dot' : ''}
              style={{
                width: 8, height: 8, borderRadius: 999,
                background: online ? TONES.green : online === false ? TONES.danger : TONES.muted,
              }}
            />
            <span className="text-xs font-medium text-text-dim">
              {online ? t('common.online') : online === false ? t('common.offline') : '…'}
            </span>
            <span className="text-[11px] text-faint font-mono hidden md:inline">{updated}</span>
          </div>

          <Button variant="primary" size="sm" icon={Play} className="hidden sm:inline-flex" onClick={() => act('start')}>
            {t('common.start')}
          </Button>
          <Button variant="cyan" size="sm" icon={House} className="hidden md:inline-flex" onClick={() => act('home')}>
            {t('common.dock')}
          </Button>
          <IconButton icon={RotateCw} label={t('common.refresh')} onClick={refresh} />
        </div>
      </div>
    </header>
  )
}
