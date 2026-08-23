import { create } from 'zustand'
import * as api from '../api'

const useAppStore = create((set, get) => ({
  // ── State ────────────────────────────────────────────────────────────────
  databases: [],
  activeDb: null,
  isLocked: true,       // true = no DB open / locked
  studentInfo: null,
  catalog: null,
  modules: {},          // { moduleNumber: record }
  stats: null,
  loading: false,
  error: null,

  // ── DB management ────────────────────────────────────────────────────────
  fetchDatabases: async () => {
    const { data } = await api.getDatabases()
    set({ databases: data })
    const { data: act } = await api.getActive()
    set({ activeDb: act.active, isLocked: !act.active })
  },

  createDb: async (name, password) => {
    await api.createDatabase(name, password)
    await get().fetchDatabases()
    await get().loadAll()
  },

  openDb: async (name, password) => {
    await api.openDatabase(name, password)
    set({ activeDb: name, isLocked: false })
    await get().fetchDatabases()
    await get().loadAll()
  },

  closeDb: async () => {
    await api.closeDatabase()
    set({ activeDb: null, isLocked: true, studentInfo: null, catalog: null, modules: {}, stats: null })
    await get().fetchDatabases()
  },

  // ── Data loading ─────────────────────────────────────────────────────────
  loadAll: async () => {
    set({ loading: true, error: null })
    try {
      const [info, cat, mods, st] = await Promise.all([
        api.getStudentInfo(),
        api.getCatalog(),
        api.getModules(),
        api.getStats(),
      ])
      const moduleMap = {}
      for (const m of mods.data) moduleMap[m.module_number] = m
      set({
        studentInfo:  info.data,
        catalog:      cat.data,
        modules:      moduleMap,
        stats:        st.data,
      })
    } catch (e) {
      set({ error: e?.response?.data?.detail || e.message })
    } finally {
      set({ loading: false })
    }
  },

  refreshStats: async () => {
    try {
      const { data } = await api.getStats()
      set({ stats: data })
    } catch (_) {}
  },

  // ── Module CRUD ──────────────────────────────────────────────────────────
  saveModule: async (moduleNumber, payload) => {
    const { data } = await api.upsertModule(moduleNumber, payload)
    set(s => ({ modules: { ...s.modules, [moduleNumber]: data } }))
    await get().refreshStats()
  },

  deleteModuleRecord: async (moduleNumber) => {
    await api.deleteModule(moduleNumber)
    set(s => {
      const modules = { ...s.modules }
      delete modules[moduleNumber]
      return { modules }
    })
    await get().refreshStats()
  },

  // ── Student info ─────────────────────────────────────────────────────────
  updateInfo: async (data) => {
    const { data: updated } = await api.updateStudentInfo(data)
    set({ studentInfo: updated })
    // Reload catalog if info_set changed (affects Informatik module set)
    const { data: cat } = await api.getCatalog()
    set({ catalog: cat })
  },

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}))

export default useAppStore
