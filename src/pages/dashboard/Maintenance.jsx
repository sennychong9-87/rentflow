import { useState } from 'react'
import { Wrench, Filter, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react'
import { useMaintenance } from '@/hooks/useMaintenance'
import { formatRelative, formatDate, cn, PRIORITY_STYLES, PRIORITY_LABELS, TICKET_STATUS_STYLES } from '@/lib/utils'
import { MAINTENANCE_CATEGORIES } from '@/lib/constants'
import EmptyState from '@/components/shared/EmptyState'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed']
const STATUS_ICONS = { open: AlertCircle, in_progress: Clock, resolved: CheckCircle, closed: XCircle }
const STATUS_COLORS = { open: 'text-blue-500', in_progress: 'text-yellow-500', resolved: 'text-green-500', closed: 'text-slate-400' }

function TicketModal({ ticket, onClose, onUpdate }) {
  const [status, setStatus] = useState(ticket.status)
  const [notes, setNotes] = useState(ticket.resolution_notes || '')
  const [cost, setCost] = useState(ticket.repair_cost || '')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    await onUpdate(ticket.id, {
      status,
      resolution_notes: notes,
      repair_cost: cost ? parseFloat(cost) : null,
      resolved_date: status === 'resolved' ? new Date().toISOString().split('T')[0] : null,
    })
    setLoading(false)
    onClose()
  }

  const StatusIcon = STATUS_ICONS[status]

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`badge ${PRIORITY_STYLES[ticket.priority]}`}>{PRIORITY_LABELS[ticket.priority]}</span>
                <span className="text-xs text-slate-400">{ticket.category}</span>
              </div>
              <h2 className="font-bold text-slate-900 text-lg">{ticket.title}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{ticket.tenants?.full_name} · Unit {ticket.units?.unit_number} · {ticket.units?.properties?.name}</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Description</p>
            <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-4">{ticket.description}</p>
          </div>
          {ticket.preferred_entry_time && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Preferred entry time</p>
              <p className="text-sm text-slate-700">{ticket.preferred_entry_time}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Update status</p>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map(s => {
                const Icon = STATUS_ICONS[s]
                return (
                  <button key={s} onClick={() => setStatus(s)}
                    className={cn('flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all capitalize', status === s ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:border-slate-300')}>
                    <Icon className={cn('w-4 h-4', status === s ? 'text-brand-500' : STATUS_COLORS[s])} />
                    {s.replace('_', ' ')}
                  </button>
                )
              })}
            </div>
          </div>
          {(status === 'resolved' || status === 'closed') && (
            <>
              <div>
                <label className="label">Resolution notes</label>
                <textarea className="input" rows={3} placeholder="What was done to fix it?" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <div>
                <label className="label">Repair cost ($) <span className="text-slate-400 font-normal">(optional)</span></label>
                <input className="input" type="number" placeholder="0" value={cost} onChange={e => setCost(e.target.value)} />
              </div>
            </>
          )}
          <p className="text-xs text-slate-400">Submitted {formatDate(ticket.created_at)}</p>
        </div>
        <div className="p-6 border-t border-slate-100 flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="btn-primary">{loading ? 'Saving…' : 'Update ticket'}</button>
        </div>
      </div>
    </div>
  )
}

export default function Maintenance() {
  const { tickets, loading, openCount, emergencyCount, updateTicket } = useMaintenance()
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [selectedTicket, setSelectedTicket] = useState(null)

  const filtered = tickets.filter(t => {
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter
    return matchStatus && matchPriority
  })

  if (loading) return <LoadingSpinner className="py-20" />

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Maintenance</h2>
          <p className="text-sm text-slate-500">{openCount} open · {emergencyCount > 0 && <span className="text-red-500 font-medium">{emergencyCount} emergency</span>}</p>
        </div>
      </div>

      {emergencyCount > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700"><strong>{emergencyCount} emergency ticket{emergencyCount > 1 ? 's' : ''}</strong> need immediate attention</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select className="input w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select className="input w-auto" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="all">All priorities</option>
          <option value="emergency">Emergency</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {tickets.length === 0 ? (
        <EmptyState icon={Wrench} title="No maintenance tickets" description="Tickets appear here when tenants submit them through their portal." />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No tickets match your filters.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(ticket => {
            const StatusIcon = STATUS_ICONS[ticket.status]
            return (
              <button key={ticket.id} onClick={() => setSelectedTicket(ticket)}
                className="card w-full p-4 text-left hover:shadow-card-hover transition-shadow">
                <div className="flex items-start gap-4">
                  <StatusIcon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', STATUS_COLORS[ticket.status])} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge ${PRIORITY_STYLES[ticket.priority]}`}>{ticket.priority}</span>
                      <span className="text-xs text-slate-400 capitalize">{ticket.category}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{ticket.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{ticket.description}</p>
                    <p className="text-xs text-slate-400 mt-1">{ticket.tenants?.full_name} · Unit {ticket.units?.unit_number} · {formatRelative(ticket.created_at)}</p>
                  </div>
                  <span className={`badge flex-shrink-0 ${TICKET_STATUS_STYLES[ticket.status]}`}>{ticket.status.replace('_', ' ')}</span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {selectedTicket && (
        <TicketModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onUpdate={updateTicket} />
      )}
    </div>
  )
}
