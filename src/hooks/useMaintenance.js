import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { logEvent } from '@/hooks/useAuditLog'

export function useMaintenance() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchTickets = useCallback(async (filters = {}) => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('maintenance')
        .select('*, tenants(full_name, email), units(unit_number, properties(name))')
        .order('created_at', { ascending: false })

      if (filters.status) query = query.eq('status', filters.status)
      if (filters.priority) query = query.eq('priority', filters.priority)
      if (filters.tenant_id) query = query.eq('tenant_id', filters.tenant_id)

      const { data, error } = await query
      if (error) throw error
      setTickets(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateTicket = async (id, updates) => {
    try {
      const prevTicket = tickets.find(t => t.id === id)
      const { data, error } = await supabase
        .from('maintenance')
        .update(updates)
        .eq('id', id)
        .select('*, tenants(full_name, email), units(unit_number, properties(name))')
        .single()
      if (error) throw error
      setTickets(prev => prev.map(t => t.id === id ? data : t))

      // Audit log on status change
      if (updates.status) {
        const action = updates.status === 'resolved' ? 'resolved' : 'updated'
        const tenantName = data.tenants?.full_name || 'Unknown'
        logEvent(data.landlord_id, {
          entity_type: 'maintenance',
          entity_id: data.id,
          entity_label: data.title,
          action,
          description: `${action === 'resolved' ? 'Resolved' : 'Updated'} maintenance ticket "${data.title}" for ${tenantName}`,
          metadata: {
            new_status: updates.status,
            old_status: prevTicket?.status,
          },
        })
      }

      return { data }
    } catch (err) {
      return { error: err.message }
    }
  }

  const deleteTicket = async (id) => {
    try {
      const { error } = await supabase.from('maintenance').delete().eq('id', id)
      if (error) throw error
      setTickets(prev => prev.filter(t => t.id !== id))
      return { success: true }
    } catch (err) {
      return { error: err.message }
    }
  }

  useEffect(() => { fetchTickets() }, [fetchTickets])

  const openCount = tickets.filter(t => t.status === 'open').length
  const emergencyCount = tickets.filter(t => t.priority === 'emergency' && t.status !== 'resolved').length

  return { tickets, loading, error, fetchTickets, updateTicket, deleteTicket, openCount, emergencyCount }
}
