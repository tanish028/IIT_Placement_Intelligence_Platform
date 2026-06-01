import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  paramsSerializer: params => {
    const parts = []
    for (const [key, val] of Object.entries(params)) {
      if (Array.isArray(val)) {
        val.forEach(v => parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`))
      } else {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
      }
    }
    return parts.join('&')
  }
})

export const getSummary = () => api.get('/stats/summary')
export const getFilters = () => api.get('/stats/filters')
export const getComparison = (institutes, year) =>
  api.get('/stats/compare', { params: { institutes, year } })
export const getBranchStats = (institute, year) =>
  api.get('/stats/branches', { params: { institute, year } })
export const getSectorStats = (institute, year) =>
  api.get('/stats/sectors', { params: { institute, year } })
export const getTrends = (institute) =>
  api.get('/stats/trends', { params: { institute } })
export const getBestIITs = (branch, year) =>
  api.get('/stats/best-iits', { params: { branch, year } })
export const getGrowthRates = (year_from, year_to) =>
  api.get('/stats/growth', { params: { year_from, year_to } })
export const predict = (data) => api.post('/predict/', data)
