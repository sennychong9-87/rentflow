import { useState } from 'react'
import { DollarSign, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'
import { useRentLedger } from '@/hooks/useRentLedger'
import { formatCurrency, formatDate, getMonthName, RENT_STATUS_STYLES, RENT_STATUS_LABELS } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import EmptyState from '@/components/shared/EmptyState'
import { PAYMENT_METHODS } from '@/lib/constants'

function RecordPaymentModal({ entry, onClose, onSave }) {
  const remaining = Math.max(0, entry.rent_due - entry.rent_paid)
  const [form, setForm] = useState({ amount: remaining, date: new Date().toISOString().split('T')[0], method: 'bank_transfer', reference: '', notes: '' })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    await onSave(entry.id, { ...form, amount: parseFloat(form.amount) })
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Record payment</h2>
          <p className="text-sm text-slate-500 mt-0.5">{entry.tenants?.full_name} · {getMonthName(entry.period_month)} {entry.period_year}</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 flex justify-between text-sm">
            <span className="text-slate-500">Rent due</span><span className="font-semibold">{formatCurrency(entry.rent_due)}</span>
          </div>
          <div>
            <label className="label">Amount received ($)</label>
            <input className="input text-lg font-semibold" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
          </div>
          <div>
            <label className="label">Payment date</label>
            <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div>
            <label className="label">Payment method</label>
            <select className="input" value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))}>
              {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Reference <span className="text-slate-400 font-normal">(optional)</span></label>
            <input className="input" placeholder="Check #, transaction ID…" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} />
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={loading || !form.amount} className="btn-primary gap-2">
            <CheckCircle className="w-4 h-4" />{loading ? 'Saving…' : 'Record payment'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RentLedger() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [payingEntry, setPayingEntry] = useState(null)
  const { ledger, loading, stats, recordPayment } = useRentLedger(month, year)

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1) }
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear()

  if (loading) return <LoadingSpinner className="py-20" />

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header with month navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Rent Ledger</h2>
          <p className="text-sm text-slate-500">Track monthly rent collection</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="btn-secondary p-2"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm font-semibold text-slate-800 min-w-[120px] text-center">{getMonthName(month)} {year}</span>
          <button onClick={nextMonth} disabled={isCurrentMonth} className="btn-secondary p-2 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total due', value: formatCurrency(stats.totalDue), color: 'text-slate-900' },
          { label: 'Collected', value: formatCurrency(stats.totalCollected), color: 'text-green-600' },
          { label: 'Outstanding', value: formatCurrency(stats.totalOutstanding), color: stats.totalOutstanding > 0 ? 'text-red-500' : 'text-slate-900' },
          { label: 'Late payments', value: stats.lateCount, color: stats.lateCount > 0 ? 'text-yellow-600' : 'text-slate-900' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Collection progress */}
      {stats.totalDue > 0 && (
        <div className="card p-4">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>{stats.paidCount} of {ledger.length} tenants paid</span>
            <span>{Math.round((stats.totalCollected / stats.totalDue) * 100)}% collected</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (stats.totalCollected / stats.totalDue) * 100)}%` }} />
          </div>
        </div>
      )}

      {/* Ledger table */}
      {ledger.length === 0 ? (
        <EmptyState icon={DollarSign} title="No rent records for this month"
          description="Rent records are created when you add tenants with active leases." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tenant</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Unit</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Due</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Paid</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Balance</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {ledger.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{entry.tenants?.full_name}</td>
                    <td className="px-4 py-3 text-slate-500">{entry.units?.unit_number}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(entry.rent_due)}</td>
                    <td className="px-4 py-3 text-right text-green-600 font-medium">{formatCurrency(entry.rent_paid)}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      <span className={entry.balance > 0 ? 'text-red-500' : 'text-slate-400'}>{formatCurrency(entry.balance)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge ${RENT_STATUS_STYLES[entry.status]}`}>{RENT_STATUS_LABELS[entry.status]}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {entry.status !== 'paid' && entry.status !== 'waived' && (
                        <button onClick={() => setPayingEntry(entry)} className="btn-ghost text-xs text-brand-600 hover:text-brand-700">
                          Record payment
                        </button>
                      )}
                      {entry.status === 'paid' && <CheckCircle className="w-4 h-4 text-green-500 inline" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {payingEntry && (
        <RecordPaymentModal entry={payingEntry} onClose={() => setPayingEntry(null)} onSave={recordPayment} />
      )}
    </div>
  )
}
