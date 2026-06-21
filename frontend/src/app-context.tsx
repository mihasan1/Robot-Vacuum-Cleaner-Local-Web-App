import { createContext, useCallback, useContext, type ReactNode } from 'react'
import { useStatus, type StatusState } from './hooks/useStatus'
import { sendAction } from './lib/api'
import { useToast } from './components/Toast'
import { useT } from './i18n'

/** labelKey — необовʼязковий ключ перекладу для тосту (інакше береться toast.<action>). */
type Act = (action: string, value?: string | number, labelKey?: string) => Promise<void>

type AppValue = StatusState & { act: Act }

const AppCtx = createContext<AppValue | null>(null)

export function useApp(): AppValue {
  const v = useContext(AppCtx)
  if (!v) throw new Error('useApp must be used within <AppProvider>')
  return v
}

export function AppProvider({ children }: { children: ReactNode }) {
  const state = useStatus()
  const { push } = useToast()
  const t = useT()

  const act = useCallback<Act>(
    async (action, value, labelKey) => {
      try {
        const j = await sendAction(action, value)
        if (j.ok) {
          push(labelKey ? t(labelKey) : t('toast.' + action), true)
          setTimeout(state.refresh, 600)
        } else {
          push(j.error ?? t('toast.err'), false)
        }
      } catch {
        push(t('toast.noConn'), false)
      }
    },
    [push, state.refresh, t],
  )

  return <AppCtx.Provider value={{ ...state, act }}>{children}</AppCtx.Provider>
}
