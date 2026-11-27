/**
 * Maps an ApiError code to an i18n key without exposing raw Backend English messages.
 * @param {unknown} error
 * @param {import('i18next').TFunction} t
 * @param {string} [fallbackKey]
 */
export function getApiErrorMessage(error, t, fallbackKey = 'errors.default') {
  const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : null

  if (typeof code === 'string' && code.length > 0) {
    const translated = t(`errors.${code}`, { defaultValue: '' })
    if (translated) return translated
  }

  return t(fallbackKey)
}
