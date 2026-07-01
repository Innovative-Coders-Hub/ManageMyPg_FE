// src/api/api.js
import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.managemypg.com/managemypg'

export const getFullImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  const base = API_BASE_URL.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

const api = axios.create({
  baseURL: API_BASE_URL
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  const type = localStorage.getItem('tokenType') || 'Bearer'
  if (token) {
    config.headers.Authorization = `${type} ${token}`
  }
  return config
})

api.interceptors.response.use(
  res => res,
  error => {
    const status = error.response?.status
    const url = error.config?.url || ''

    // All login endpoints (admin / owner / tenant)
    const LOGIN_ENDPOINTS = [
      '/api/admin/login',
      '/api/auth/login'
    ]

    const isLoginRequest = LOGIN_ENDPOINTS.some(endpoint =>
      url.includes(endpoint)
    )

    if ((status === 401 || status === 403) && !isLoginRequest) {
      const isAdmin = localStorage.getItem('isAdmin') === 'true' || window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/application/administrator')
      localStorage.clear()
      window.location.href = isAdmin ? '/application/administrator/login' : '/manage/mypg/signin'
    }

    return Promise.reject(error)
  }
)


export default api
