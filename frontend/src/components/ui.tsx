import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { IconType, Option } from '../lib/meta'
import { useT } from '../i18n'

const SHADOW = 'shadow-[0_12px_34px_-20px_rgba(0,0,0,0.85)]'

export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return <section className={`rounded-card border border-line bg-surface ${SHADOW} ${className}`}>{children}</section>
}

export function CardHead({
  icon: Icon, title, desc, tone = '#7c5cff', action,
}: { icon?: IconType; title: string; desc?: string; tone?: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-5">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <span className="grid place-items-center h-9 w-9 rounded-xl shrink-0" style={{ background: tone + '1f', color: tone }}>
            <Icon size={18} />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold truncate">{title}</h3>
          {desc && <p className="text-xs text-muted truncate mt-0.5">{desc}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

type BtnVariant = 'primary' | 'cyan' | 'ghost' | 'danger' | 'success'

const VARIANTS: Record<BtnVariant, string> = {
  primary: 'text-white bg-[linear-gradient(180deg,#8b6dff,#6d4bf0)] hover:brightness-110 shadow-[0_10px_24px_-12px_rgba(124,92,255,0.9)]',
  cyan: 'text-[#04222a] font-semibold bg-[linear-gradient(180deg,#43e0f2,#16b8d4)] hover:brightness-110 shadow-[0_10px_24px_-12px_rgba(34,211,238,0.8)]',
  ghost: 'text-text-dim bg-surface-2 border border-line hover:border-line-2 hover:text-text',
  danger: 'text-[#ffb4b4] bg-transparent border border-[#3a2233] hover:border-danger hover:text-danger',
  success: 'text-[#062018] font-semibold bg-[linear-gradient(180deg,#4ce0b0,#22c594)] hover:brightness-110',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
  icon?: IconType
  size?: 'md' | 'sm'
}

export function Button({ variant = 'ghost', icon: Icon, size = 'md', className = '', children, ...rest }: ButtonProps) {
  const s = size === 'sm' ? 'h-9 px-3 text-[13px]' : 'h-11 px-4 text-sm'
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition active:scale-[.985] disabled:opacity-50 disabled:pointer-events-none select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${s} ${VARIANTS[variant]} ${className}`}
    >
      {Icon && <Icon size={size === 'sm' ? 15 : 17} />}
      {children}
    </button>
  )
}

export function IconButton({
  icon: Icon, className = '', label, ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { icon: IconType; label?: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      {...rest}
      className={`grid place-items-center h-10 w-10 rounded-xl bg-surface-2 border border-line text-muted transition hover:text-text hover:border-line-2 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${className}`}
    >
      <Icon size={18} />
    </button>
  )
}

export function Segmented({
  options, value, onChange,
}: { options: Option[]; value: string | null | undefined; onChange: (v: string) => void }) {
  const t = useT()
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
      {options.map(({ value: v, key, Icon }) => {
        const on = v === value
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`group flex flex-col items-center gap-2 rounded-xl border px-2 py-3.5 transition active:scale-[.97] ${
              on ? 'border-primary/55 bg-primary/12' : 'border-line bg-surface-2/40 hover:border-line-2'
            }`}
          >
            <Icon size={19} className={on ? 'text-primary-2' : 'text-muted group-hover:text-text-dim'} />
            <span className={`text-xs font-medium ${on ? 'text-text' : 'text-muted'}`}>{t(key)}</span>
          </button>
        )
      })}
    </div>
  )
}

export function Progress({ value, color = '#7c5cff', className = '' }: { value: number; color?: string; className?: string }) {
  const w = Math.max(0, Math.min(100, value))
  return (
    <div className={`h-2 rounded-full bg-surface-3 overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: w + '%', background: `linear-gradient(90deg, ${color}, ${color}bb)` }}
      />
    </div>
  )
}

export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-line/60 last:border-0 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-right">{children}</span>
    </div>
  )
}
