import { useI18n, LANGS } from '../i18n'

export function LangToggle() {
  const { lang, setLang } = useI18n()
  return (
    <div className="inline-flex items-center h-9 p-0.5 rounded-full border border-line bg-surface-2/60" role="group" aria-label="Language">
      {LANGS.map(({ value, label }) => {
        const on = value === lang
        return (
          <button
            key={value}
            onClick={() => setLang(value)}
            aria-pressed={on}
            className={`h-8 px-3 rounded-full text-xs font-semibold transition ${
              on ? 'bg-[linear-gradient(180deg,#8b6dff,#6d4bf0)] text-white' : 'text-muted hover:text-text'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
