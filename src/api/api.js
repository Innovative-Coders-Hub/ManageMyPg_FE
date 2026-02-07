// src/api/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
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

    if (status === 401 || status === 403) {
      // global session expired
      localStorage.clear()
      window.location.href = '/signin'
    }

    return Promise.reject(error)
  }
)

export default api
