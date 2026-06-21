import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { en, type Key } from './en'
import { uk } from './uk'

export type Lang = 'en' | 'uk'
export const LANGS: { value: Lang; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'uk', label: 'UA' },
]

const DICTS = { en, uk } as const
type Params = Record<string, string | number>

interface I18nValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: Key | (string & {}), params?: Params) => string
}

const Ctx = createContext<I18nValue | null>(null)

export function useI18n(): I18nValue {
  const v = useContext(Ctx)
  if (!v) throw new Error('useI18n must be used within <LangProvider>')
  return v
}
export const useT = () => useI18n().t

const STORAGE_KEY = 'robovac.lang'

function readInitial(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'uk') return saved
  } catch {
    /* localStorage недоступний */
  }
  return 'en' // English за замовчуванням
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitial)

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try { localStorage.setItem(STORAGE_KEY, l) } catch { /* ignore */ }
    document.documentElement.lang = l
  }, [])

  useEffect(() => { document.documentElement.lang = lang }, [lang])

  const t = useCallback(
    (key: string, params?: Params) => {
      const dict = DICTS[lang] as Record<string, string>
      let s = dict[key] ?? (en as Record<string, string>)[key] ?? key
      if (params) {
        for (const k in params) s = s.split('{' + k + '}').join(String(params[k]))
      }
      return s
    },
    [lang],
  )

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>
}
