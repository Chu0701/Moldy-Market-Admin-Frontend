const ACCESS_TOKEN_KEY = 'moldy-market:admin:access-token'
const AccessTokenEvents = new EventTarget()

export function getAccessToken() {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  } catch {
    return null
  }
}

/** @param {() => void} listener */
export function subscribeToAccessToken(listener) {
  AccessTokenEvents.addEventListener('change', listener)
  const unsubscribeStorage = subscribeToCrossTabTokenChange(listener)
  return () => {
    AccessTokenEvents.removeEventListener('change', listener)
    unsubscribeStorage()
  }
}

/** @param {() => void} listener */
export function subscribeToCrossTabTokenChange(listener) {
  if (typeof window === 'undefined') return () => {}
  const handleStorage = (event) => {
    if (event.key === null || event.key === ACCESS_TOKEN_KEY) {
      listener()
    }
  }
  window.addEventListener('storage', handleStorage)
  return () => window.removeEventListener('storage', handleStorage)
}

/** @param {string} token */
export function setAccessToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
  AccessTokenEvents.dispatchEvent(new Event('change'))
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  AccessTokenEvents.dispatchEvent(new Event('change'))
}
