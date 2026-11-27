/**
 * Formats a numeric amount in VND.
 * @param {number | string | null | undefined} amount
 * @param {string} [locale]
 */
export function formatVnd(amount, locale = 'vi-VN') {
  if (amount === null || amount === undefined || amount === '') return '-'
  const numeric = Number(amount)
  if (!Number.isFinite(numeric)) return '-'

  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(numeric)
}

/**
 * Formats an ISO timestamp string into a readable local date/time.
 * @param {string | null | undefined} isoString
 * @param {string} [locale]
 */
export function formatDateTime(isoString, locale = 'vi-VN') {
  if (!isoString) return '-'
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
