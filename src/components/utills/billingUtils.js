import dayjs from 'dayjs'

export function calculateExtension(oldEnd, newEnd, monthlyRent) {
  if (!oldEnd || !newEnd) return null
  const oldD = dayjs(oldEnd)
  const newD = dayjs(newEnd)
  if (!oldD.isValid() || !newD.isValid()) return null
  if (!newD.isAfter(oldD)) return null

  const days = newD.diff(oldD, 'day')
  const perDay = (Number(monthlyRent) || 0) / 30
  return {
    days,
    amount: Math.round(days * perDay),
  }
}

export function buildBillingPeriods(joinDateISO, endDateISO) {
  if (!joinDateISO) return []

  const start = dayjs(joinDateISO)
  if (!start.isValid()) return []

  const end = endDateISO
    ? dayjs(endDateISO)
    : dayjs().add(1, 'month')

  if (!end.isValid()) return []

  const periods = []
  let from = start.startOf('month')
  let guard = 0

  while (end.diff(from, 'month') >= 0 && guard < 36) {
    periods.push({
      key: from.format('YYYY-MM'), // ✅ FIXED
      from: from.startOf('month').toISOString(),
      to: from.endOf('month').toISOString(),
      label: from.format('MMM YYYY'),
      isFirst: guard === 0,
    })

    from = from.add(1, 'month')
    guard++
  }

  return periods
}


export function dueStatus(period, payment) {
  const now = dayjs()
  const periodMonth = dayjs(period.from)

  // 🔮 Future month
  if (periodMonth.isAfter(now, 'month')) {
    return { label: 'Upcoming', tone: 'gray' }
  }

  // 🧠 Backend-driven status (highest priority)
  if (payment?.status === 'PAID') {
    return { label: 'Paid', tone: 'green' }
  }

  if (payment?.status === 'PARTIALLY_PAID') {
    return { label: 'Partially Paid', tone: 'amber' }
  }

  // 🟥 Current / past month, no payment yet
  if (!payment) {
    return { label: 'Due', tone: 'red' }
  }

  // 🟡 Fallback (safety)
  if (payment.pending > 0) {
    return { label: 'Partially Paid', tone: 'amber' }
  }

  return { label: 'Paid', tone: 'green' }
}


export function firstMonthProrationInfo(joinISO) {
  const d = dayjs(joinISO); if (!d.isValid()) return { daysProrated: 0, daysInMonth: 0 }
  const endOfMonth = d.endOf('month')
  return { daysProrated: endOfMonth.diff(d, 'day') + 1, daysInMonth: endOfMonth.daysInMonth() }
}
