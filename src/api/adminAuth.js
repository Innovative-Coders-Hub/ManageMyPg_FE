import api from './api'

export const adminLogin = (payload) => {
  return api.post('/api/admin/login', payload)
}

export const adminLogout = () => {
  return api.post('/api/admin/logout')
}

export const getAdminDashboard = (limit) => {
  const params = limit ? { params: { limit } } : {}
  return api.get('/api/admin/dashboard', params)
}

export const getAllOwners = (params) => {
  return api.get('/api/admin/owners', { params })
}

export const updateOwnerStatus = (payload) => {
  return api.put('/api/admin/owner/status', payload)
}
