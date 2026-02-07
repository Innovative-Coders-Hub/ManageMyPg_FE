import dayjs from 'dayjs'

export function minVacateDate() {
  return dayjs().add(30, 'day').startOf('day')
}

export const hasVacated = (endDate) =>
  !!endDate && dayjs(endDate).endOf('day').isBefore(dayjs())

export const vacatingBadge = (endDate) => {
  if (!endDate) return null
  const days = dayjs(endDate).diff(dayjs(), 'day')
  if (days < 0) return null
  return `Vacating in ${days} day${days !== 1 ? 's' : ''}`
}

export const fmt = (d, f = 'DD MMM YYYY') => (dayjs(d).isValid() ? dayjs(d).format(f) : '—')

export const fmtShort = (d) => (dayjs(d).isValid() ? dayjs(d).format("MMM ’YY") : '—')
