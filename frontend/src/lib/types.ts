export interface RobotStatus {
  ok: boolean
  status: string | null
  mode: string | null
  battery: number | null
  suction: string | null
  cistern: string | null
  volume: number | null
  disturb: boolean | null
  fault: number
  clean_time: number
  clean_area: number
  total_count: number
  total_area: number
  total_time: number
  edge_brush: number | null
  roll_brush: number | null
  filter: number | null
  duster_cloth: number | null
  raw: Record<string, unknown>
}

export interface ActionResult {
  ok: boolean
  label?: string
  error?: string
  result?: unknown
}

/** Один зразок живої історії під час сесії (для графіка). */
export interface Sample {
  t: number
  battery: number | null
  area: number
}

export type ViewId = 'dashboard' | 'map' | 'maintenance' | 'stats' | 'settings'
