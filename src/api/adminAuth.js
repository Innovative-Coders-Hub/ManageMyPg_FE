import api from './api'

export const adminLogin = ({ email, password }) => {
  return api.post('/admin/login', { email, password })
}

export const adminLogout = () => {
  return api.post('/admin/logout')
}

