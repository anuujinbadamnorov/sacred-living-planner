import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  parse,
  parseISO,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  getWeek,
  getYear,
  isToday,
} from 'date-fns'

// Get all days for a monthly calendar grid (including prev/next month padding)
export function getMonthDays(year: number, month: number): Date[] {
  const firstDay = startOfMonth(new Date(year, month))
  const lastDay = endOfMonth(firstDay)
  const start = startOfWeek(firstDay, { weekStartsOn: 0 })
  const end = endOfWeek(lastDay, { weekStartsOn: 0 })
  return eachDayOfInterval({ start, end })
}

// Get days for a specific week
export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 0 })
  const end = endOfWeek(date, { weekStartsOn: 0 })
  return eachDayOfInterval({ start, end })
}

// Format a date for display
export function formatDate(date: Date, pattern: string = 'yyyy-MM-dd'): string {
  return format(date, pattern)
}

// Parse a date string
export function parseDate(dateString: string, pattern: string = 'yyyy-MM-dd'): Date {
  return parse(dateString, pattern, new Date())
}

// Parse ISO date
export function parseISODate(dateString: string): Date {
  return parseISO(dateString)
}

// Get month name
export function getMonthName(month: number, short: boolean = false): string {
  const date = new Date(2026, month)
  return format(date, short ? 'MMM' : 'MMMM')
}

// Get day name
export function getDayName(date: Date, short: boolean = true): string {
  return format(date, short ? 'EEE' : 'EEEE')
}

// Navigation helpers
export function nextMonth(date: Date): Date {
  return addMonths(date, 1)
}

export function prevMonth(date: Date): Date {
  return subMonths(date, 1)
}

export function nextWeek(date: Date): Date {
  return addWeeks(date, 1)
}

export function prevWeek(date: Date): Date {
  return subWeeks(date, 1)
}

export function nextDay(date: Date): Date {
  return addDays(date, 1)
}

export function prevDay(date: Date): Date {
  return subDays(date, 1)
}

// Checkers
export function checkIsSameMonth(date: Date, base: Date): boolean {
  return isSameMonth(date, base)
}

export function checkIsSameDay(date: Date, base: Date): boolean {
  return isSameDay(date, base)
}

export function checkIsToday(date: Date): boolean {
  return isToday(date)
}

// Week number
export function getWeekNumber(date: Date): number {
  return getWeek(date)
}

export function getYearNumber(date: Date): number {
  return getYear(date)
}

// Generate month options for 2026
export function getPlannerMonths(): { value: number; label: string }[] {
  const months = []
  for (let i = 5; i <= 11; i++) {
    months.push({
      value: i,
      label: getMonthName(i),
    })
  }
  return months
}

// Date key for localStorage
export function dateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

// Month key for localStorage
export function monthKey(date: Date): string {
  return format(date, 'yyyy-MM')
}

// Week key for localStorage
export function weekKey(date: Date): string {
  return `${getYearNumber(date)}-W${getWeekNumber(date)}`
}
