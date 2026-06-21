import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { CheckCircle2, AlertTriangle } from 'lucide-react'

interface ToastItem { id: number; msg: string; ok: boolean }
interface ToastCtx { push: (msg: string, ok?: boolean) => void }

const Ctx = createContext<ToastCtx>({ push: () => {} })
export const useToast = () => useContext(Ctx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const push = useCallback((msg: string, ok = true) => {
    const id = ++idRef.current
    setItems((s) => [...s, { id, msg, ok }])
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 2400)
  }, [])

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="fixed inset-x-0 bottom-24 lg:bottom-6 z-[60] flex flex-col items-center gap-2 px-4 pointer-events-none">
        {items.map((t) => (
          <div
            key={t.id}
            className="animate-in pointer-events-auto flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm font-medium backdrop-blur-md"
            style={{
              borderColor: t.ok ? 'rgba(52,211,153,0.45)' : 'rgba(248,113,113,0.45)',
              background: t.ok ? 'rgba(6,24,18,0.88)' : 'rgba(30,12,12,0.88)',
              color: t.ok ? '#9ef0d2' : '#fca5a5',
            }}
          >
            {t.ok ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {t.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
