import api from './api'

// ---------- PROMOTIONS & OFFERS API ----------

// 1. Fetch Owner's Promotions
export const getMyPromotions = async () => {
  const res = await api.get('/mmp/promotions/my-promotions')
  return res.data?.data || []
}

// 2. Create / Re-publish Promotion
export const createPromotion = async (payload) => {
  const sanitizedPayload = {
    ...payload,
    discountValue: (payload.discountValue !== '' && payload.discountValue !== null && payload.discountValue !== undefined)
      ? Number(payload.discountValue)
      : null,
    targetPgId: (payload.targetPgId === 'ALL' || !payload.targetPgId) ? null : payload.targetPgId
  }
  const res = await api.post('/mmp/promotions', sanitizedPayload)
  return res.data?.data
}

// 3. Update Promotion
export const updatePromotionApi = async (id, payload) => {
  const sanitizedPayload = {
    ...payload,
    discountValue: (payload.discountValue !== '' && payload.discountValue !== null && payload.discountValue !== undefined)
      ? Number(payload.discountValue)
      : null,
    targetPgId: (payload.targetPgId === 'ALL' || !payload.targetPgId) ? null : payload.targetPgId
  }
  const res = await api.put(`/mmp/promotions/${id}`, sanitizedPayload)
  return res.data?.data
}

// 4. Toggle Live / Draft Status
export const togglePromotionStatusApi = async (id) => {
  const res = await api.patch(`/mmp/promotions/${id}/toggle-status`)
  return res.data?.data
}

// 5. Immediately End Promotion Today
export const expirePromotionTodayApi = async (id) => {
  const res = await api.patch(`/mmp/promotions/${id}/expire`)
  return res.data?.data
}

// 6. Delete Promotion
export const deletePromotionApi = async (id) => {
  const res = await api.delete(`/mmp/promotions/${id}`)
  return res.data
}

// 7. Get Active Promotions for Tenant PG
export const getActivePromotionsForPg = async (pgId) => {
  const res = await api.get(`/mmp/promotions/active/pg/${pgId}`)
  return res.data?.data || []
}

// 8. Upload Promotion Banner Image to Server
export const uploadPromotionBannerApi = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const res = await api.post('/mmp/promotions/banner/upload', formData)
  return res.data?.data?.bannerUrl
}

