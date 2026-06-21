import type { ComponentType } from 'react'
import {
  Sparkles, LayoutGrid, DoorOpen, Crosshair,
  Wind, Waves, Zap, Droplet, Droplets,
  Brush, Cylinder, Filter, Layers,
  BatteryCharging, Pause, Moon, House, Activity, CircleDot, Trash2,
} from 'lucide-react'

export type IconType = ComponentType<{ size?: number | string; className?: string; strokeWidth?: number }>
export type Translate = (key: string, params?: Record<string, string | number>) => string

export type Tone = 'green' | 'cyan' | 'violet' | 'amber' | 'orange' | 'pink' | 'danger' | 'muted'

export const TONES: Record<Tone, string> = {
  green: '#34d399', cyan: '#22d3ee', violet: '#9d7bff', amber: '#fbbf24',
  orange: '#fb923c', pink: '#f472b6', danger: '#f87171', muted: '#8b97ad',
}

/** Опція сегментованого контролу. `key` — ключ перекладу. */
export interface Option { value: string; key: string; Icon: IconType }

export const MODES: Option[] = [
  { value: 'smart', key: 'mode.smart', Icon: Sparkles },
  { value: 'zone', key: 'mode.zone', Icon: LayoutGrid },
  { value: 'part', key: 'mode.part', Icon: DoorOpen },
  { value: 'pose', key: 'mode.pose', Icon: Crosshair },
]

export const SUCTION: Option[] = [
  { value: 'gentle', key: 'suction.gentle', Icon: Waves },
  { value: 'normal', key: 'suction.normal', Icon: Wind },
  { value: 'strong', key: 'suction.strong', Icon: Zap },
]

export const WATER: Option[] = [
  { value: 'low', key: 'water.low', Icon: Droplet },
  { value: 'middle', key: 'water.middle', Icon: Droplets },
  { value: 'high', key: 'water.high', Icon: Waves },
]

export interface MaintItem {
  field: string
  labelKey: string
  reset: string
  maxHours: number
  Icon: IconType
  tone: Tone
}

export const MAINTENANCE: MaintItem[] = [
  { field: 'edge_brush', labelKey: 'maint.edge', reset: 'reset_edge_brush', maxHours: 180, Icon: Brush, tone: 'cyan' },
  { field: 'roll_brush', labelKey: 'maint.roll', reset: 'reset_roll_brush', maxHours: 300, Icon: Cylinder, tone: 'violet' },
  { field: 'filter', labelKey: 'maint.filter', reset: 'reset_filter', maxHours: 150, Icon: Filter, tone: 'green' },
  { field: 'duster_cloth', labelKey: 'maint.cloth', reset: 'reset_duster_cloth', maxHours: 60, Icon: Layers, tone: 'pink' },
]

interface StatusMeta { key: string; tone: Tone; Icon: IconType }

function humanize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')
}

/** Повертає ключ перекладу + тон + іконку для статусу робота. */
export function statusMeta(status: string | null | undefined): StatusMeta {
  switch (status) {
    case 'charging': return { key: 'status.charging', tone: 'cyan', Icon: BatteryCharging }
    case 'standby': return { key: 'status.standby', tone: 'muted', Icon: Pause }
    case 'sleep': return { key: 'status.sleep', tone: 'violet', Icon: Moon }
    case 'cleaning':
    case 'smart':
    case 'zone':
    case 'part':
    case 'pose': return { key: 'status.cleaning', tone: 'green', Icon: Activity }
    case 'paused': return { key: 'status.paused', tone: 'amber', Icon: Pause }
    case 'goto_charge':
    case 'go_charging':
    case 'chargego': return { key: 'status.returning', tone: 'cyan', Icon: House }
    case 'collect_dust': return { key: 'status.collecting', tone: 'violet', Icon: Trash2 }
    default: return { key: status ? humanize(status) : '—', tone: 'muted', Icon: CircleDot }
  }
}

export const CLEANING_STATES = ['cleaning', 'smart', 'zone', 'part', 'pose']

export function clampPct(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)))
}

/**
 * Ресурс щітки/фільтра приходить або як відсоток (0–100), або як хвилини залишку.
 * Розпізнаємо обидва випадки, щоб не вводити в оману.
 */
export function formatLife(
  value: number | null | undefined,
  maxHours: number,
  t: Translate,
): { pct: number; text: string } {
  if (value == null) return { pct: 0, text: '—' }
  if (value <= 100) return { pct: clampPct(value), text: value + '%' }
  const hours = Math.round(value / 60)
  return { pct: clampPct((value / (maxHours * 60)) * 100), text: '≈' + hours + ' ' + t('unit.hours') }
}

export function batteryColor(b: number | null | undefined): string {
  if (b == null) return TONES.muted
  if (b <= 20) return TONES.orange
  if (b <= 50) return TONES.amber
  return TONES.green
}
