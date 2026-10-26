import {
  differenceInCalendarDays,
  format,
  parseISO,
  startOfDay,
} from 'date-fns'
import type { ReceivablePayment, ReceivableStatus } from '../types/database'

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'dd MMM yyyy')
}

export function toInputDate(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd')
}

export function sumPayments(payments: ReceivablePayment[]): number {
  return payments.reduce((sum, p) => sum + Number(p.amount), 0)
}

export function receivableMetrics(
  amountDue: number,
  payments: ReceivablePayment[],
  dueDate: string,
  today = startOfDay(new Date()),
) {
  const received = sumPayments(payments)
  const outstanding = Math.max(0, Number(amountDue) - received)
  const due = startOfDay(parseISO(dueDate))

  let status: ReceivableStatus = 'Pending'
  if (outstanding <= 0.009) {
    status = 'Paid'
  } else if (due < today) {
    status = 'Overdue'
  }

  const daysOverdue =
    status === 'Overdue' ? differenceInCalendarDays(today, due) : 0

  return { received, outstanding, status, daysOverdue }
}

export function statusBadgeClass(status: ReceivableStatus): string {
  switch (status) {
    case 'Paid':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'Pending':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'Overdue':
      return 'bg-red-100 text-red-800 border-red-200'
  }
}
