import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

/**
 * Oura API Proxy — Authenticated
 * Fetches health data from Oura API using the stored token in user_settings.
 * Endpoint: GET /api/oura/today?date=2026-07-16
 * No token required — uses the authenticated user's stored token.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
  const range = searchParams.get('range') || '7' // days of history to fetch

  // Get user session from cookies
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  // Fetch the stored Oura token
  const { data: settings, error: settingsError } = await supabase
    .from('user_settings')
    .select('oura_token')
    .eq('user_id', user.id)
    .single()

  if (settingsError || !settings?.oura_token) {
    return NextResponse.json({ error: 'Oura token not configured. Connect your Oura Ring in Settings.' }, { status: 404 })
  }

  const token = settings.oura_token

  try {
    // Calculate date range
    const endDate = date
    const startDateObj = new Date(date)
    startDateObj.setDate(startDateObj.getDate() - parseInt(range, 10) + 1)
    const startDate = startDateObj.toISOString().split('T')[0]

    // Fetch sleep data
    const sleepRes = await fetch(
      `https://api.ouraring.com/v2/usercollection/sleep?start_date=${startDate}&end_date=${endDate}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const sleepData = sleepRes.ok ? await sleepRes.json() : { data: [] }

    // Fetch readiness data
    const readinessRes = await fetch(
      `https://api.ouraring.com/v2/usercollection/daily_readiness?start_date=${startDate}&end_date=${endDate}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const readinessData = readinessRes.ok ? await readinessRes.json() : { data: [] }

    // Fetch activity data
    const activityRes = await fetch(
      `https://api.ouraring.com/v2/usercollection/daily_activity?start_date=${startDate}&end_date=${endDate}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const activityData = activityRes.ok ? await activityRes.json() : { data: [] }

    // Build a map by date
    const resultMap = new Map<string, any>()

    const ensureEntry = (d: string) => {
      if (!resultMap.has(d)) {
        resultMap.set(d, {
          date: d,
          sleep_score: null,
          readiness_score: null,
          activity_score: null,
          steps: null,
          hrv: null,
          resting_hr: null,
          deep_sleep: null,
          rem_sleep: null,
          total_sleep: null,
        })
      }
      return resultMap.get(d)!
    }

    // Populate sleep data
    for (const item of sleepData.data || []) {
      const d = item.day || item.date
      if (!d) continue
      const entry = ensureEntry(d)
      entry.sleep_score = item.score ?? null
      entry.resting_hr = item.resting_heart_rate ?? null
      entry.deep_sleep = item.deep_sleep_duration ? Math.round(item.deep_sleep_duration / 60) : null
      entry.rem_sleep = item.rem_sleep_duration ? Math.round(item.rem_sleep_duration / 60) : null
      entry.total_sleep = item.total_sleep_duration ? Math.round(item.total_sleep_duration / 60) : null
    }

    // Populate readiness data
    for (const item of readinessData.data || []) {
      const d = item.day || item.date
      if (!d) continue
      const entry = ensureEntry(d)
      entry.readiness_score = item.score ?? null
      entry.hrv = item.hrv_average ?? null
    }

    // Populate activity data
    for (const item of activityData.data || []) {
      const d = item.day || item.date
      if (!d) continue
      const entry = ensureEntry(d)
      entry.activity_score = item.score ?? null
      entry.steps = item.steps ?? null
    }

    const results = Array.from(resultMap.values()).sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
      date,
      range: parseInt(range, 10),
      data: results,
    })
  } catch (error) {
    console.error('Oura API error:', error)
    return NextResponse.json({ error: 'Failed to fetch Oura data' }, { status: 500 })
  }
}
