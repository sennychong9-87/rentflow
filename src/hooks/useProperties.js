import { useEffect } from 'react'
import { usePropertyStore } from '@/store/propertyStore'

export function useProperties(autoFetch = true) {
  const store = usePropertyStore()

  useEffect(() => {
    if (autoFetch && store.properties.length === 0 && !store.loading) {
      store.fetchProperties()
    }
  }, [autoFetch])

  return store
}
