/** Express/Mongo API (admin login, uploads, legacy). */
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

/** When true, catalog/content/orders/admin use Vercel `/api` (Aurora DSQL on AWS). */
export const isDsqlBackend = () => {
  const raw = String(import.meta.env.VITE_DATA_BACKEND || '')
    .trim()
    .toLowerCase()
  if (raw === 'firebase' || raw === 'mongo' || raw === 'legacy' || raw === 'false' || raw === '0')
    return false
  if (raw === 'dsql' || raw === 'true' || raw === '1') return true
  // Production builds default to DSQL so deployed sites use AWS without extra env.
  return import.meta.env.PROD === true
}

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
