import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export const useTenantStore = create((set, get) => ({
  tenants: [],
  loading: false,
  error: null,

  fetchTenants: async () => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*, units(unit_number, monthly_rent, properties(name))')
        .order('created_at', { ascending: false })
      if (error) throw error
      set({ tenants: data })
    } catch (error) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },

  addTenant: async (tenantData) => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .insert(tenantData)
        .select('*, units(unit_number, monthly_rent, properties(name))')
        .single()
      if (error) throw error
      set(state => ({ tenants: [data, ...state.tenants] }))
      // Mark unit as occupied
      if (tenantData.unit_id) {
        await supabase.from('units').update({ status: 'occupied' }).eq('id', tenantData.unit_id)
      }
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  updateTenant: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .update(updates)
        .eq('id', id)
        .select('*, units(unit_number, monthly_rent, properties(name))')
        .single()
      if (error) throw error
      set(state => ({
        tenants: state.tenants.map(t => t.id === id ? data : t)
      }))
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  deleteTenant: async (id) => {
    try {
      const tenant = get().tenants.find(t => t.id === id)
      const { error } = await supabase.from('tenants').delete().eq('id', id)
      if (error) throw error
      // Mark unit as vacant
      if (tenant?.unit_id) {
        await supabase.from('units').update({ status: 'vacant' }).eq('id', tenant.unit_id)
      }
      set(state => ({ tenants: state.tenants.filter(t => t.id !== id) }))
      return { success: true }
    } catch (error) {
      return { error: error.message }
    }
  },

  // Fetch single tenant by portal token (for tenant portal page — no auth)
  fetchByPortalToken: async (token) => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*, units(*, properties(*))')
        .eq('portal_token', token)
        .single()
      if (error) throw error
      // Update last accessed
      await supabase
        .from('tenants')
        .update({ portal_last_accessed: new Date().toISOString() })
        .eq('portal_token', token)
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },
}))
