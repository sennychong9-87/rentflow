import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export async function logEvent(landlordId, eventData) {
  try {
    const { error } = await supabase.from('audit_log').insert({
      landlord_id: landlordId,
      entity_type: eventData.entity_type,
      entity_id: eventData.entity_id,
      entity_label: eventData.entity_label,
      action: eventData.action,
      description: eventData.description,
      metadata: eventData.metadata || {},
    })
    if (error) throw error
  } catch (err) {
    console.error('Audit log error:', err)
  }
}

export async function fetchAuditLogs(filters = {}) {
  try {
    let query = supabase
      .from('audit_log')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(filters.limit || 50)

    if (filters.landlord_id) query = query.eq('landlord_id', filters.landlord_id)
    if (filters.entity_type) query = query.eq('entity_type', filters.entity_type)
    if (filters.entity_id) query = query.eq('entity_id', filters.entity_id)
    if (filters.search) query = query.ilike('description', `%${filters.search}%`)

    if (filters.from) query = query.gte('created_at', filters.from)
    if (filters.to) query = query.lte('created_at', filters.to)

    if (filters.page && filters.page > 1) {
      const from = (filters.page - 1) * (filters.limit || 50)
      const to = from + (filters.limit || 50) - 1
      query = query.range(from, to)
    }

    const { data, error, count } = await query
    if (error) throw error
    return { data: data || [], count }
  } catch (err) {
    console.error('Fetch audit logs error:', err)
    return { data: [], count: 0 }
  }
}

export function useAuditLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  const loadLogs = useCallback(async (filters = {}) => {
    setLoading(true)
    const { data, count } = await fetchAuditLogs(filters)
    if (filters.append) {
      setLogs(prev => [...prev, ...data])
    } else {
      setLogs(data)
    }
    setTotalCount(count || 0)
    setLoading(false)
  }, [])

  return { logs, loading, totalCount, loadLogs }
}
