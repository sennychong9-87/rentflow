import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentPeriod } from '@/lib/utils'
import { logEvent } from '@/hooks/useAuditLog'

export function useRentLedger(month, year) {
  const [ledger, setLedger] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const period = month && year ? { month, year } : getCurrentPeriod()

  const fetchLedger = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('rent_ledger')
        .select('*, tenants(full_name, email), units(unit_number, properties(name))')
        .eq('period_month', period.month)
        .eq('period_year', period.year)
        .order('created_at', { ascending: false })
      if (error) throw error
      setLedger(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [period.month, period.year])

  const recordPayment = async (id, paymentData) => {
    try {
      const entry = ledger.find(l => l.id === id)
      const newPaid = (entry?.rent_paid || 0) + paymentData.amount
      const newStatus = newPaid >= entry.rent_due ? 'paid' : 'partial'

      const { data, error } = await supabase
        .from('rent_ledger')
        .update({
          rent_paid: newPaid,
          status: newStatus,
          payment_date: paymentData.date || new Date().toISOString().split('T')[0],
          payment_method: paymentData.method,
          payment_reference: paymentData.reference,
          notes: paymentData.notes,
        })
        .eq('id', id)
        .select('*, tenants(full_name, email), units(unit_number, properties(name))')
        .single()
      if (error) throw error
      setLedger(prev => prev.map(l => l.id === id ? data : l))

      const tenantName = data.tenants?.full_name || 'Unknown'
      const unitLabel = data.units?.unit_number ? ` — ${data.units.unit_number}` : ''
      logEvent(data.landlord_id, {
        entity_type: 'rent',
        entity_id: data.id,
        entity_label: `${tenantName}${unitLabel}`,
        action: 'paid',
        description: `Rent marked as paid for ${tenantName}${unitLabel}`,
        metadata: {
          amount: paymentData.amount,
          period_month: data.period_month,
          period_year: data.period_year,
        },
      })

      return { data }
    } catch (err) {
      return { error: err.message }
    }
  }

  useEffect(() => { fetchLedger() }, [fetchLedger])

  // Summary stats
  const totalDue = ledger.reduce((sum, l) => sum + (l.rent_due || 0), 0)
  const totalCollected = ledger.reduce((sum, l) => sum + (l.rent_paid || 0), 0)
  const totalOutstanding = ledger.reduce((sum, l) => sum + Math.max(0, l.balance || 0), 0)
  const paidCount = ledger.filter(l => l.status === 'paid').length
  const pendingCount = ledger.filter(l => l.status === 'pending').length
  const lateCount = ledger.filter(l => l.status === 'late').length

  return {
    ledger, loading, error, fetchLedger, recordPayment,
    stats: { totalDue, totalCollected, totalOutstanding, paidCount, pendingCount, lateCount }
  }
}
