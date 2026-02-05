// utils/authHeader.ts
export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server'
  const key = 'device_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

export function buildClientHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  return {
    'User-Agent': navigator.userAgent,
    'X-Platform': 'web',
    'X-Device-Fingerprint': getDeviceId(),
  }
}
