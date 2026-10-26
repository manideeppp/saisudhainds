import { endOfMonth, format, startOfMonth } from 'date-fns'

export interface DatePeriod {
  start: string
  end: string
  label: string
}

export function monthPeriod(year: number, month: number): DatePeriod {
  const start = startOfMonth(new Date(year, month - 1, 1))
  const end = endOfMonth(start)
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
    label: format(start, 'MMMM yyyy'),
  }
}

export function customPeriod(start: string, end: string): DatePeriod {
  return { start, end, label: `${start} to ${end}` }
}

export function inPeriod(dateStr: string, period: DatePeriod): boolean {
  return dateStr >= period.start && dateStr <= period.end
}
