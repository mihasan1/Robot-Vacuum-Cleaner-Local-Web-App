import type { ActionResult, RobotStatus } from './types'

export async function fetchStatus(signal?: AbortSignal): Promise<RobotStatus> {
  const r = await fetch('/api/status', { signal })
  if (!r.ok) throw new Error('HTTP ' + r.status)
  return r.json()
}

export async function sendAction(
  action: string,
  value?: string | number,
): Promise<ActionResult> {
  const u = new URL('/api/action', location.origin)
  u.searchParams.set('action', action)
  if (value !== undefined) u.searchParams.set('value', String(value))
  const r = await fetch(u)
  return r.json()
}

export function mapUrl(): string {
  return '/api/map?ts=' + Date.now()
}
