import { NAV } from '../nav'
import type { ViewId } from '../lib/types'
import { useT } from '../i18n'

export function MobileNav({ view, onNav }: { view: ViewId; onNav: (v: ViewId) => void }) {
  const t = useT()
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-line bg-bg/90 backdrop-blur-xl">
      <div className="grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
        {NAV.map(({ id, Icon }) => {
          const on = id === view
          return (
            <button
              key={id}
              onClick={() => onNav(id)}
              className="relative flex flex-col items-center gap-1 py-2.5 transition active:scale-95"
            >
              {on && <span className="absolute top-0 h-0.5 w-9 rounded-full bg-primary-2" />}
              <Icon size={20} className={on ? 'text-primary-2' : 'text-muted'} />
              <span className={`text-[10px] font-medium ${on ? 'text-text' : 'text-muted'}`}>{t('nav.short.' + id)}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
