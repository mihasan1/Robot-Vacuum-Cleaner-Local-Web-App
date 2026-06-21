import { useId } from 'react'
import { useT } from '../i18n'

export function LogoMark({ size = 36 }: { size?: number }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden>
      <rect width="36" height="36" rx="10" fill={`url(#bg-${id})`} />
      <rect x="0.6" y="0.6" width="34.8" height="34.8" rx="9.4" stroke="#ffffff" strokeOpacity="0.06" />
      <circle cx="18" cy="18" r="11" stroke={`url(#st-${id})`} strokeWidth="2.4" />
      <circle cx="18" cy="18" r="3.6" fill={`url(#st-${id})`} />
      <path d="M18 7.4v3.4" stroke={`url(#st-${id})`} strokeWidth="2.2" strokeLinecap="round" />
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1a2236" />
          <stop offset="1" stopColor="#0c111c" />
        </linearGradient>
        <linearGradient id={`st-${id}`} x1="7" y1="7" x2="29" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9d7bff" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function Wordmark() {
  const t = useT()
  return (
    <div className="leading-tight">
      <div className="font-semibold tracking-tight">RoboVac</div>
      <div className="text-[11px] text-muted -mt-0.5">{t('brand.tagline')}</div>
    </div>
  )
}
