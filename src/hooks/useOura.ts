import { useState, useEffect, useCallback } from 'react'
import {
  OuraClient,
  getOuraToken,
  setOuraToken as storeToken,
  clearOuraToken,
  getLastSyncTime,
  setLastSyncTime,
  getCachedData,
  setCachedData,
  CACHE_KEYS,
  type OuraSleep,
  type OuraReadiness,
  type OuraActivity,
  type OuraHeartRate,
  type OuraPersonalInfo,
} from '@/lib/ouraApi'
import { format, subDays } from 'date-fns'

/* ──────── Mock data for demo ──────── */

function generateMockSleep(overrides?: Partial<OuraSleep>): OuraSleep {
  return {
    id: 'mock-sleep-1',
    day: format(new Date(), 'yyyy-MM-dd'),
    score: 78,
    duration: 27300,
    deep_sleep_duration: 5700,
    light_sleep_duration: 12600,
    rem_sleep_duration: 7200,
    latency: 900,
    efficiency: 88,
    resting_heart_rate: 52,
    hrv_average: 65,
    temperature_deviation: 0.2,
    bedtime_start: '2026-01-13T22:45:00-08:00',
    bedtime_end: '2026-01-14T06:20:00-08:00',
    breath_average: 14.2,
    awake_duration: 1800,
    ...overrides,
  }
}

function generateMockReadiness(overrides?: Partial<OuraReadiness>): OuraReadiness {
  return {
    id: 'mock-readiness-1',
    day: format(new Date(), 'yyyy-MM-dd'),
    score: 82,
    temperature_deviation: 0.1,
    resting_heart_rate: 52,
    hrv_balance: 85,
    recovery_index: 78,
    sleep_balance: 88,
    ...overrides,
  }
}

function generateMockActivity(overrides?: Partial<OuraActivity>): OuraActivity {
  return {
    id: 'mock-activity-1',
    day: format(new Date(), 'yyyy-MM-dd'),
    score: 85,
    steps: 8432,
    total_calories: 2180,
    active_calories: 520,
    target_calories: 2800,
    equivalent_walking_distance: 6200,
    sedentary_time: 420,
    stay_active_time: 165,
    ...overrides,
  }
}

function generateWeeklyMockData() {
  const today = new Date()
  const sleep: OuraSleep[] = []
  const readiness: OuraReadiness[] = []
  const activity: OuraActivity[] = []

  const sleepScores = [72, 80, 65, 88, 75, 78, 78]
  const readinessScores = [76, 84, 70, 90, 79, 82, 82]
  const activityScores = [68, 92, 78, 85, 72, 80, 85]
  const stepsArr = [6200, 10500, 8100, 9800, 5400, 7200, 8432]

  for (let i = 6; i >= 0; i--) {
    const day = subDays(today, i)
    const dayStr = format(day, 'yyyy-MM-dd')
    const idx = 6 - i

    sleep.push(
      generateMockSleep({
        id: `mock-sleep-${idx}`,
        day: dayStr,
        score: sleepScores[idx],
        duration: 24000 + Math.floor(Math.random() * 6000),
      })
    )
    readiness.push(
      generateMockReadiness({
        id: `mock-readiness-${idx}`,
        day: dayStr,
        score: readinessScores[idx],
      })
    )
    activity.push(
      generateMockActivity({
        id: `mock-activity-${idx}`,
        day: dayStr,
        score: activityScores[idx],
        steps: stepsArr[idx],
      })
    )
  }

  return { sleep, readiness, activity }
}

const mockData = generateWeeklyMockData()

/* ──────── Hook ──────── */

export interface UseOuraReturn {
  token: string | null
  sleepData: OuraSleep[] | null
  readinessData: OuraReadiness[] | null
  activityData: OuraActivity[] | null
  heartRateData: OuraHeartRate[] | null
  personalInfo: OuraPersonalInfo | null
  loading: boolean
  error: string | null
  isMockData: boolean
  setToken: (t: string) => Promise<void>
  clearToken: () => void
  fetchData: () => Promise<void>
  lastSync: string | null
}

const isFetching = { current: false }

export function useOura(): UseOuraReturn {
  const [token, setTokenState] = useState<string | null>(getOuraToken)
  const [sleepData, setSleepData] = useState<OuraSleep[] | null>(null)
  const [readinessData, setReadinessData] = useState<OuraReadiness[] | null>(null)
  const [activityData, setActivityData] = useState<OuraActivity[] | null>(null)
  const [heartRateData, setHeartRateData] = useState<OuraHeartRate[] | null>(null)
  const [personalInfo, setPersonalInfo] = useState<OuraPersonalInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMockData, setIsMockData] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(getLastSyncTime)

  // Load cached data on mount
  useEffect(() => {
    const cachedSleep = getCachedData<OuraSleep[]>(CACHE_KEYS.sleep)
    const cachedReadiness = getCachedData<OuraReadiness[]>(CACHE_KEYS.readiness)
    const cachedActivity = getCachedData<OuraActivity[]>(CACHE_KEYS.activity)
    const cachedHR = getCachedData<OuraHeartRate[]>(CACHE_KEYS.heartRate)
    const cachedInfo = getCachedData<OuraPersonalInfo>(CACHE_KEYS.personalInfo)

    if (cachedSleep) setSleepData(cachedSleep)
    if (cachedReadiness) setReadinessData(cachedReadiness)
    if (cachedActivity) setActivityData(cachedActivity)
    if (cachedHR) setHeartRateData(cachedHR)
    if (cachedInfo) setPersonalInfo(cachedInfo)

    // If no token and no cached data, show mock data
    if (!token && !cachedSleep) {
      loadMockData()
    }
  }, [token])

  const loadMockData = useCallback(() => {
    setSleepData(mockData.sleep)
    setReadinessData(mockData.readiness)
    setActivityData(mockData.activity)
    setHeartRateData([
      { bpm: 48, timestamp: format(subDays(new Date(), 0), "yyyy-MM-dd'T'02:00:00") + '-08:00', source: 'sleep' },
      { bpm: 52, timestamp: format(subDays(new Date(), 0), "yyyy-MM-dd'T'03:00:00") + '-08:00', source: 'sleep' },
      { bpm: 50, timestamp: format(subDays(new Date(), 0), "yyyy-MM-dd'T'04:00:00") + '-08:00', source: 'sleep' },
      { bpm: 55, timestamp: format(subDays(new Date(), 0), "yyyy-MM-dd'T'05:00:00") + '-08:00', source: 'sleep' },
    ])
    setIsMockData(true)
    setError(null)
  }, [])

  const fetchData = useCallback(async () => {
    // Prevent concurrent fetches
    if (isFetching.current) return
    isFetching.current = true

    setLoading(true)
    setError(null)

    try {
      if (!token) {
        loadMockData()
        setLoading(false)
        isFetching.current = false
        return
      }

      const client = new OuraClient(token)
      const today = format(new Date(), 'yyyy-MM-dd')
      const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd')

      try {
        // Fetch all data in parallel
        const [sleepRes, readinessRes, activityRes] = await Promise.all([
          client.getDailySleep(weekAgo, today),
          client.getDailyReadiness(weekAgo, today),
          client.getDailyActivity(weekAgo, today),
        ])

        const sleep = sleepRes.data || []
        const readiness = readinessRes.data || []
        const activity = activityRes.data || []

        // Try to get heart rate data (may fail for some tokens)
        try {
          const hrRes = await client.getHeartRate(
            `${weekAgo}T00:00:00-08:00`,
            `${today}T23:59:59-08:00`
          )
          setHeartRateData(hrRes.data || [])
          setCachedData(CACHE_KEYS.heartRate, hrRes.data || [])
        } catch {
          // Heart rate is optional
          setHeartRateData(null)
        }

        // Try personal info
        try {
          const info = await client.getPersonalInfo()
          setPersonalInfo(info)
          setCachedData(CACHE_KEYS.personalInfo, info)
        } catch {
          // Personal info is optional
        }

        setSleepData(sleep)
        setReadinessData(readiness)
        setActivityData(activity)
        setIsMockData(false)

        // Cache the data
        setCachedData(CACHE_KEYS.sleep, sleep)
        setCachedData(CACHE_KEYS.readiness, readiness)
        setCachedData(CACHE_KEYS.activity, activity)

        setLastSyncTime()
        setLastSync(new Date().toISOString())
      } catch (apiErr: any) {
        console.error('Oura API error:', apiErr)
        setError(apiErr.message || 'Failed to fetch Oura data')
        // Fall back to mock data on error
        loadMockData()
      }
    } finally {
      setLoading(false)
      isFetching.current = false
    }
  }, [token, loadMockData])

  const setToken = useCallback(async (t: string) => {
    storeToken(t)
    setTokenState(t)
    setIsMockData(false)
    // Auto-fetch after setting token
    await new Promise((resolve) => setTimeout(resolve, 100))
    await fetchData()
  }, [fetchData])

  const clearTokenCb = useCallback(() => {
    clearOuraToken()
    setTokenState(null)
    setPersonalInfo(null)
    loadMockData()
    setLastSync(null)
  }, [loadMockData])

  // Auto-fetch on initial load if token exists
  useEffect(() => {
    if (token && !sleepData) {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return {
    token,
    sleepData,
    readinessData,
    activityData,
    heartRateData,
    personalInfo,
    loading,
    error,
    isMockData,
    setToken,
    clearToken: clearTokenCb,
    fetchData,
    lastSync,
  }
}
