import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  // Initialize — call once on app load
  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        set({ user: session.user })
        await get().fetchProfile(session.user.id)
      }
    } catch (error) {
      console.error('Auth init error:', error)
    } finally {
      set({ loading: false, initialized: true })
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        set({ user: session.user })
        await get().fetchProfile(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, profile: null })
      }
    })
  },

  fetchProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) throw error
      set({ profile: data })
    } catch (error) {
      console.error('Profile fetch error:', error)
    }
  },

  updateProfile: async (updates) => {
    const { user } = get()
    if (!user) return { error: 'Not authenticated' }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()
      if (error) throw error
      set({ profile: data })
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  signUp: async ({ email, password, fullName }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) throw error
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  signIn: async ({ email, password }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },

  resetPassword: async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${import.meta.env.VITE_APP_URL}/reset-password`,
      })
      if (error) throw error
      return { success: true }
    } catch (error) {
      return { error: error.message }
    }
  },
}))
