import { LayoutDashboard, Map, Wrench, ChartColumn, Settings } from 'lucide-react'
import type { ViewId } from './lib/types'
import type { IconType } from './lib/meta'

export interface NavItem {
  id: ViewId
  section: string // ключ перекладу секції (control | reports | system)
  Icon: IconType
}

export const NAV: NavItem[] = [
  { id: 'dashboard', section: 'control', Icon: LayoutDashboard },
  { id: 'map', section: 'control', Icon: Map },
  { id: 'maintenance', section: 'reports', Icon: Wrench },
  { id: 'stats', section: 'reports', Icon: ChartColumn },
  { id: 'settings', section: 'system', Icon: Settings },
]

export const SECTIONS = ['control', 'reports', 'system']
