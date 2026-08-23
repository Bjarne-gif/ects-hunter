import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// ── Databases ────────────────────────────────────────────────────────────────
export const getDatabases    = ()               => api.get('/databases')
export const getActive       = ()               => api.get('/databases/active')
export const createDatabase  = (name, password) => api.post('/databases', { name, password })
export const openDatabase    = (name, password) => api.post(`/databases/${name}/open`, { password })
export const closeDatabase   = ()               => api.post('/databases/close')

// ── Student info ─────────────────────────────────────────────────────────────
export const getStudentInfo  = ()     => api.get('/student/info')
export const updateStudentInfo = data => api.put('/student/info', data)
export const getCatalog      = ()     => api.get('/student/catalog')

// ── Modules ──────────────────────────────────────────────────────────────────
export const getModules      = ()              => api.get('/modules')
export const upsertModule    = (num, data)     => api.put(`/modules/${num}`, data)
export const deleteModule    = (num)           => api.delete(`/modules/${num}`)

// ── Statistics ───────────────────────────────────────────────────────────────
export const getStats        = ()              => api.get('/stats')
