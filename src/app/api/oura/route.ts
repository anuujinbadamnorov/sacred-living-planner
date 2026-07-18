import { NextResponse } from 'next/server'

/**
 * Oura API Proxy
 * Fetches health data from Oura API using the user's token
 * Endpoint: GET /api/oura?token=xxx&date=2026-07-16
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
  
  if (!token) {
    return NextResponse.json({ error: 'Oura token required' }, { status: 401 })
  }

  try {
    // Fetch sleep data
    const sleepRes = await fetch(
      `https://api.ouraring.com/v2/usercollection/sleep?start_date=${date}&end_date=${date}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const sleepData = sleepRes.ok ? await sleepRes.json() : null

    // Fetch readiness data
    const readinessRes = await fetch(
      `https://api.ouraring.com/v2/usercollection/daily_readiness?start_date=${date}&end_date=${date}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const readinessData = readinessRes.ok ? await readinessRes.json() : null

    // Fetch activity data
    const activityRes = await fetch(
      `https://api.ouraring.com/v2/usercollection/daily_activity?start_date=${date}&end_date=${date}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const activityData = activityRes.ok ? await activityRes.json() : null

    // If every request failed, surface Oura's error instead of silent nulls
    // (e.g. invalid/expired token returns 401 — the UI can tell the user)
    if (!sleepRes.ok && !readinessRes.ok && !activityRes.ok) {
      const status = sleepRes.status || 502
      return NextResponse.json(
        { error: `Oura API rejected the request (status ${status}). Check that your token is valid and hasn't been revoked.` },
        { status: status === 401 ? 401 : 502 }
      )
    }

    // Extract metrics
    const sleep = sleepData?.data?.[0]
    const readiness = readinessData?.data?.[0]
    const activity = activityData?.data?.[0]

    return NextResponse.json({
      date,
      sleep_score: sleep?.score || null,
      readiness_score: readiness?.score || null,
      activity_score: activity?.score || null,
      steps: activity?.steps || null,
      // Oura v2 exposes average_hrv on sleep, not readiness
      hrv: sleep?.average_hrv || readiness?.average_hrv || null,
      // v2 sleep has lowest_heart_rate / average_heart_rate (no resting_heart_rate)
      resting_hr: sleep?.lowest_heart_rate || sleep?.average_heart_rate || null,
      deep_sleep: sleep?.deep_sleep_duration ? Math.round(sleep.deep_sleep_duration / 60) : null,
      rem_sleep: sleep?.rem_sleep_duration ? Math.round(sleep.rem_sleep_duration / 60) : null,
      total_sleep: sleep?.total_sleep_duration ? Math.round(sleep.total_sleep_duration / 60) : null,
    })
  } catch (error) {
    console.error('Oura API error:', error)
    return NextResponse.json({ error: 'Failed to fetch Oura data' }, { status: 500 })
  }
}
