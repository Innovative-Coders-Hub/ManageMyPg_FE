import api from './api'

// ---------- PROMOTIONS & OFFERS API ----------

// 1. Fetch Owner's Promotions
export const getMyPromotions = async () => {
  try {
    const res = await api.get('/mmp/promotions/my-promotions')
    return res.data?.data || []
  } catch (err) {
    console.warn('API unavailable, falling back to local storage promotions:', err)
    const raw = localStorage.getItem('mmp_active_promotions')
    return raw ? JSON.parse(raw) : []
  }
}

// 2. Create / Re-publish Promotion
export const createPromotion = async (payload) => {
  try {
    const sanitizedPayload = {
      ...payload,
      targetPgId: (payload.targetPgId === 'ALL' || !payload.targetPgId) ? null : payload.targetPgId
    }
    const res = await api.post('/mmp/promotions', sanitizedPayload)
    return res.data?.data
  } catch (err) {
    console.warn('API error creating promotion, using local fallback:', err)
    return null
  }
}

// 3. Update Promotion
export const updatePromotionApi = async (id, payload) => {
  try {
    const sanitizedPayload = {
      ...payload,
      targetPgId: (payload.targetPgId === 'ALL' || !payload.targetPgId) ? null : payload.targetPgId
    }
    const res = await api.put(`/mmp/promotions/${id}`, sanitizedPayload)
    return res.data?.data
  } catch (err) {
    console.warn('API error updating promotion:', err)
    return null
  }
}

// 4. Toggle Live / Draft Status
export const togglePromotionStatusApi = async (id) => {
  try {
    const res = await api.patch(`/mmp/promotions/${id}/toggle-status`)
    return res.data?.data
  } catch (err) {
    console.warn('API error toggling promotion status:', err)
    return null
  }
}

// 5. Immediately End Promotion Today
export const expirePromotionTodayApi = async (id) => {
  try {
    const res = await api.patch(`/mmp/promotions/${id}/expire`)
    return res.data?.data
  } catch (err) {
    console.warn('API error expiring promotion:', err)
    return null
  }
}

// 6. Delete Promotion
export const deletePromotionApi = async (id) => {
  try {
    const res = await api.delete(`/mmp/promotions/${id}`)
    return res.data
  } catch (err) {
    console.warn('API error deleting promotion:', err)
    return null
  }
}

// 7. Get Active Promotions for Tenant PG
export const getActivePromotionsForPg = async (pgId) => {
  try {
    const res = await api.get(`/mmp/promotions/active/pg/${pgId}`)
    return res.data?.data || []
  } catch (err) {
    console.warn('API unavailable for tenant active promotions:', err)
    const raw = localStorage.getItem('mmp_active_promotions')
    return raw ? JSON.parse(raw) : []
  }
}

// 8. Upload Promotion Banner Image to Server
export const uploadPromotionBannerApi = async (file) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await api.post('/mmp/promotions/banner/upload', formData)
    return res.data?.data?.bannerUrl
  } catch (err) {
    console.warn('API error uploading banner image:', err)
    return null
  }
}
