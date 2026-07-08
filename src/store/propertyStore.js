import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export const usePropertyStore = create((set, get) => ({
  properties: [],
  units: [],
  loading: false,
  error: null,

  fetchProperties: async () => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*, units(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      set({ properties: data, units: data.flatMap(p => p.units || []) })
    } catch (error) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },

  addProperty: async (propertyData) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert(propertyData)
        .select('*, units(*)')
        .single()
      if (error) throw error
      set(state => ({ properties: [data, ...state.properties] }))
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  updateProperty: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select('*, units(*)')
        .single()
      if (error) throw error
      set(state => ({
        properties: state.properties.map(p => p.id === id ? data : p)
      }))
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  deleteProperty: async (id) => {
    try {
      const { error } = await supabase.from('properties').delete().eq('id', id)
      if (error) throw error
      set(state => ({
        properties: state.properties.filter(p => p.id !== id),
        units: state.units.filter(u => u.property_id !== id)
      }))
      return { success: true }
    } catch (error) {
      return { error: error.message }
    }
  },

  addUnit: async (unitData) => {
    try {
      const { data, error } = await supabase
        .from('units')
        .insert(unitData)
        .select()
        .single()
      if (error) throw error
      set(state => ({ units: [...state.units, data] }))
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  updateUnit: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('units')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      set(state => ({
        units: state.units.map(u => u.id === id ? data : u)
      }))
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  // Computed: stats for dashboard
  getStats: () => {
    const { units } = get()
    return {
      totalUnits: units.length,
      occupied: units.filter(u => u.status === 'occupied').length,
      vacant: units.filter(u => u.status === 'vacant').length,
      maintenance: units.filter(u => u.status === 'maintenance').length,
    }
  }
}))
