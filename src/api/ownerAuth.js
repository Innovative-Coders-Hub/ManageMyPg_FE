
import api from './api'

// ---------- AUTH ----------
export const registerOwner = (payload) => {
  const res = api.post(`/mmp/owner/create`, payload)
  return res.data
}

export async function ownerLogin({ email, password }) {
  try {
    const res = await api.post('/api/auth/login', { email, password })
    return res.data
  } catch (err) {
    throw {
      status: err?.response?.status,
      message:
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Invalid email or password",
    }
  }
}

export const ownerLogout = () => {
  return api.post('/api/auth/logout')
}

// ---------- PROFILE ----------

export async function getOwnerProfile() {
  const res = await api.get('/mmp/owner/ownerProfile')
  return res.data
}

export async function updateOwnerAddress(address) {
  const res = await api.patch('/mmp/owner/ownerProfile/address', address)
  return res.data
}

// ---------- PG ----------

export async function createPg(body) {
  const res = await api.post('/mmp/pg/create', body)
  return res.data
}

export async function getAllPgs() {
  const res = await api.get('/mmp/pg/getAll/pgs')
  return res.data
}

export async function getPgDetailsById(id) {
  if (!id) {
    throw new Error('PG id is required')
  }
  const res = await api.get(`/mmp/pg/${id}`)
  return res.data
}

// ---------- FLOORS / BEDS ----------

export async function createFloor(payload) {
  const res = await api.post('/mmp/floor/Rooms/create', payload)
  return res.data
}

export async function getFloorsByPg(pgId) {
  const res = await api.get(`/mmp/floor/Rooms/pg/${pgId}`)
  return res.data
}

export async function createBed(payload) {
  const res = await api.post('/mmp/beds/newBed', payload)
  return res.data
}

export async function getBedDetails(bedId) {
  const res = await api.get(`/mmp/beds/${bedId}`)
  return res.data
}

// ---------- TENANTS ----------

export async function registerTenant(formData) {
  const res = await api.post('/mmp/tenants/register', formData)
  return res.data
}

export async function getAllTenants(pgId) {
  if (!pgId) {
    throw new Error('pgId is required to fetch tenants')
  }
  const res = await api.get(`/mmp/tenants/pg/${pgId}`)
  return res.data
}

export async function assignTenantToBed(bedId, tenantId) {
  const res = await api.post(`/mmp/beds/${bedId}/assign/${tenantId}`)
  return res.data
}

export async function getTenantDetails(tenantId) {
  try {
    const res = await api.get(`/mmp/tenants/${tenantId}`)
    return res.data
  } catch (e) {
    console.error('Failed to fetch tenant details', e)
    throw e
  }
}
export async function getTenantHistory(tenantId) {
  try {
    const res = await api.get(`/mmp/tenants/owner/${tenantId}`)
    return res.data
  } catch (e) {
    console.error('Failed to fetch tenant details', e)
    throw e
  }
}

export async function markRentAsPaid(tenantId, payload) {
  const res = await api.post(
    `/mmp/tenants/${tenantId}/rent/pay`,
    payload
  )
  return res.data
}

export async function updateVacatingDate(tenantId, payload) {
  const res = await api.post(
    `/mmp/tenants/${tenantId}/vacating-date`,
    {
      vacatingDate: payload.vacatingDate,
      reason: payload.reason || null
    }
  )
  return res.data
}