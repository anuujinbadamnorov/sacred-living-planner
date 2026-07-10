/* ──────── Oura API Client ──────── */

const OURA_BASE = 'https://api.ouraring.com/v2'

/* ── Types ── */

export interface OuraSleep {
  id: string
  day: string
  score: number
  duration: number
  deep_sleep_duration: number
  light_sleep_duration: number
  rem_sleep_duration: number
  latency: number
  efficiency: number
  resting_heart_rate: number
  hrv_average: number
  temperature_deviation: number
  bedtime_start: string
  bedtime_end: string
  breath_average: number
  awake_duration: number
  [key: string]: any
}

export interface OuraReadiness {
  id: string
  day: string
  score: number
  temperature_deviation: number
  resting_heart_rate: number
  hrv_balance: number
  recovery_index: number
  sleep_balance: number
  [key: string]: any
}

export interface OuraActivity {
  id: string
  day: string
  score: number
  steps: number
  total_calories: number
  active_calories: number
  target_calories: number
  equivalent_walking_distance: number
  sedentary_time: number
  stay_active_time: number
  [key: string]: any
}

export interface OuraHeartRate {
  bpm: number
  timestamp: string
  source: string
}

export interface OuraPersonalInfo {
  id: string
  age: number
  weight: number
  height: number
  biological_sex: string
  email: string
}

export interface OuraListResponse<T> {
  data: T[]
  next_token?: string
}

/* ── Token Storage ── */

const TOKEN_KEY = 'planner-oura-token'
const LAST_SYNC_KEY = 'planner-oura-last-sync'

export function getOuraToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setOuraToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearOuraToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
}

export function getLastSyncTime(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(LAST_SYNC_KEY)
}

export function setLastSyncTime(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString())
}

/* ── Cache ── */

export const CACHE_KEYS = {
  sleep: 'oura-cache-sleep',
  readiness: 'oura-cache-readiness',
  activity: 'oura-cache-activity',
  heartRate: 'oura-cache-hr',
  personalInfo: 'oura-cache-info',
} as const

export function getCachedData<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setCachedData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // ignore
  }
}

/* ── Client ── */

export class OuraClient {
  private token: string

  constructor(token: string) {
    this.token = token
  }

  private async request<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${OURA_BASE}${path}`)
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    }
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${this.token}` },
    })
    if (!res.ok) {
      throw new Error(`Oura API error: ${res.status} ${res.statusText}`)
    }
    return res.json()
  }

  async getDailySleep(start: string, end: string): Promise<OuraListResponse<OuraSleep>> {
    return this.request('/usercollection/daily_sleep', { start_date: start, end_date: end })
  }

  async getDailyReadiness(start: string, end: string): Promise<OuraListResponse<OuraReadiness>> {
    return this.request('/usercollection/daily_readiness', { start_date: start, end_date: end })
  }

  async getDailyActivity(start: string, end: string): Promise<OuraListResponse<OuraActivity>> {
    return this.request('/usercollection/daily_activity', { start_date: start, end_date: end })
  }

  async getHeartRate(start: string, end: string): Promise<OuraListResponse<OuraHeartRate>> {
    return this.request('/usercollection/heartrate', { start_datetime: start, end_datetime: end })
  }

  async getPersonalInfo(): Promise<OuraPersonalInfo> {
    return this.request('/usercollection/personal_info')
  }
}
