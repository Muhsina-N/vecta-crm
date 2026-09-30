import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })

// Attach the saved login token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Turn any error into a readable message
export function errMsg(err) {
  return err?.response?.data?.message || err?.message || 'Something went wrong'
}

export default api
