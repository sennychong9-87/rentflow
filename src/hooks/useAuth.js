import { useAuthStore } from '@/store/authStore'

// Convenience hook — components import this instead of the store directly
export function useAuth() {
  const {
    user,
    profile,
    loading,
    initialized,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    fetchProfile,
  } = useAuthStore()

  return {
    user,
    profile,
    loading,
    initialized,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    fetchProfile,
  }
}
