/** Express/Mongo API (admin login, uploads, legacy). */
const PROD_API_BASE = 'https://backend-branded-shoes-hub.vercel.app/api'
const defaultApiBase =
  import.meta.env.DEV || window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : PROD_API_BASE

export const API_BASE = (import.meta.env.VITE_API_URL || defaultApiBase).replace(/\/$/, '')

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
