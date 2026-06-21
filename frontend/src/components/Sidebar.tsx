import { useApp } from '../app-context'
import { NAV, SECTIONS } from '../nav'
import type { ViewId } from '../lib/types'
import { statusMeta, batteryColor, TONES } from '../lib/meta'
import { Progress } from './ui'
import { LogoMark, Wordmark } from './Logo'
import { useT } from '../i18n'

export function Sidebar({ view, onNav }: { view: ViewId; onNav: (v: ViewId) => void }) {
  const t = useT()
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-0 h-screen border-r border-line bg-surface/30 backdrop-blur-xl">
      <div className="h-16 px-5 flex items-center gap-3 border-b border-line">
        <LogoMark size={36} />
        <Wordmark />
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-5 space-y-6">
        {SECTIONS.map((sec) => (
          <div key={sec}>
            <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
              {t('nav.section.' + sec)}
            </div>
            <div className="space-y-1">
              {NAV.filter((n) => n.section === sec).map(({ id, Icon }) => {
                const on = id === view
                return (
                  <button
                    key={id}
                    onClick={() => onNav(id)}
                    className={`flex items-center gap-3 w-full rounded-xl px-3 h-11 text-sm font-medium transition ${
                      on
                        ? 'text-white bg-[linear-gradient(180deg,#8b6dff,#6d4bf0)] shadow-[0_10px_22px_-12px_rgba(124,92,255,0.95)]'
                        : 'text-muted hover:text-text hover:bg-surface-2'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{t('nav.' + id)}</span>
                    {on && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/85" />}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-line">
        <MiniStatus />
      </div>
    </aside>
  )
}

function MiniStatus() {
  const { status, online } = useApp()
  const t = useT()
  const b = status?.battery ?? null
  const sm = statusMeta(status?.status)
  return (
    <div className="rounded-xl border border-line bg-surface-2/50 p-3.5">
      <div className="flex items-center gap-2 text-xs">
        <span
          className={online ? 'pulse-dot' : ''}
          style={{
            width: 8, height: 8, borderRadius: 999,
            background: online ? TONES.green : online === false ? TONES.danger : TONES.muted,
          }}
        />
        <span className="text-muted">
          {online ? t('common.online') : online === false ? t('common.offline') : t('common.connecting')}
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: batteryColor(b) }}>
          <sm.Icon size={14} />
          {b == null ? '—' : b + '%'}
        </span>
      </div>
      <div className="mt-2.5 mb-2 text-sm font-medium">{t(sm.key)}</div>
      <Progress value={b ?? 0} color={batteryColor(b)} />
    </div>
  )
}
