import { useEffect } from 'react'
import { useTenantStore } from '@/store/tenantStore'

export function useTenants(autoFetch = true) {
  const store = useTenantStore()

  useEffect(() => {
    if (autoFetch && store.tenants.length === 0 && !store.loading) {
      store.fetchTenants()
    }
  }, [autoFetch])

  return store
}
