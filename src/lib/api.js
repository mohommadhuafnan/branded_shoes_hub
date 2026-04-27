/** Express/Mongo API (admin login, uploads, legacy). */
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

/** When `VITE_DATA_BACKEND=dsql`, catalog/content/orders/user-state use Vercel `/api` (Aurora DSQL). */
export const isDsqlBackend = () => String(import.meta.env.VITE_DATA_BACKEND || '').toLowerCase() === 'dsql'

/** Prefix for DSQL serverless routes (`/api/products`, etc.). Same-origin on Vercel, or full URL. */
export const dsqlApiPrefix = () => {
  const raw = (import.meta.env.VITE_DSQL_API_PREFIX || '').trim()
  if (raw) return raw.replace(/\/$/, '')
  return ''
}

const getApiHost = () => {
  if (API_BASE.endsWith('/api')) return API_BASE.slice(0, -4)
  return API_BASE
}

export const toAbsoluteImageUrl = (imagePath) => {
  if (!imagePath) return ''
  if (imagePath.startsWith('http')) return imagePath
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  return `${getApiHost()}${normalizedPath}`
}

export const authHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Build URL for a DSQL route path like `/api/products`. */
export const dsqlUrl = (path) => {
  const p = path.startsWith('/') ? path : `/${path}`
  const base = dsqlApiPrefix()
  return base ? `${base}${p}` : p
}
