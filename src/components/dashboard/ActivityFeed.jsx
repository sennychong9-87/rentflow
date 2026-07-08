import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatRelative } from '@/lib/utils'
import { DollarSign, Wrench, Users, MessageSquare, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

const EVENT_CONFIG = {
  rent_paid:      { icon: DollarSign, color: 'bg-green-100 text-green-600',  label: 'Rent recorded' },
  ticket_open:    { icon: Wrench,     color: 'bg-blue-100 text-blue-600',    label: 'New ticket' },
  ticket_resolved:{ icon: Wrench,     color: 'bg-green-100 text-green-600',  label: 'Ticket resolved' },
  tenant_added:   { icon: Users,      color: 'bg-purple-100 text-purple-600',label: 'Tenant added' },
  message:        { icon: MessageSquare,color:'bg-slate-100 text-slate-600', label: 'Message' },
  document:       { icon: FileText,   color: 'bg-yellow-100 text-yellow-600',label: 'Document uploaded' },
}

/**
 * ActivityFeed — recent activity across all properties
 * Pulls the latest events from maintenance + messages + rent_ledger
 */
export default function ActivityFeed({ limit = 8 }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: tickets }, { data: messages }, { data: payments }] = await Promise.all([
        supabase
          .from('maintenance')
          .select('id, title, status, created_at, tenants(full_name), units(unit_number)')
          .order('created_at', { ascending: false })
          .limit(limit),
        supabase
          .from('messages')
          .select('id, body, sender, created_at, tenants(full_name)')
          .order('created_at', { ascending: false })
          .limit(limit),
        supabase
          .from('rent_ledger')
          .select('id, rent_paid, status, updated_at, tenants(full_name), units(unit_number)')
          .eq('status', 'paid')
          .order('updated_at', { ascending: false })
          .limit(limit),
      ])

      const all = [
        ...(tickets || []).map(t => ({
          id: `ticket-${t.id}`,
          type: t.status === 'resolved' ? 'ticket_resolved' : 'ticket_open',
          description: t.title,
          person: t.tenants?.full_name,
          unit: t.units?.unit_number ? `Unit ${t.units.unit_number}` : null,
          time: t.created_at,
          to: '/dashboard/maintenance',
        })),
        ...(messages || []).filter(m => m.sender === 'tenant').map(m => ({
          id: `msg-${m.id}`,
          type: 'message',
          description: m.body?.slice(0, 50) + (m.body?.length > 50 ? '…' : ''),
          person: m.tenants?.full_name,
          time: m.created_at,
          to: '/dashboard/messages',
        })),
        ...(payments || []).map(p => ({
          id: `pay-${p.id}`,
          type: 'rent_paid',
          description: `Rent payment recorded — $${p.rent_paid}`,
          person: p.tenants?.full_name,
          unit: p.units?.unit_number ? `Unit ${p.units.unit_number}` : null,
          time: p.updated_at,
          to: '/dashboard/rent',
        })),
      ]

      // Sort all by time descending, take top N
      all.sort((a, b) => new Date(b.time) - new Date(a.time))
      setEvents(all.slice(0, limit))
      setLoading(false)
    }

    load()
  }, [limit])

  if (loading) return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-card p-5">
      <h3 className="font-semibold text-slate-900 mb-4">Recent activity</h3>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-8 h-8 bg-slate-100 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-slate-100 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-card p-5">
      <h3 className="font-semibold text-slate-900 mb-4">Recent activity</h3>

      {events.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">
          No activity yet — add tenants to get started.
        </p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const config = EVENT_CONFIG[event.type] || EVENT_CONFIG.message
            const Icon = config.icon

            return (
              <Link
                key={event.id}
                to={event.to || '#'}
                className="flex items-start gap-3 hover:bg-slate-50 rounded-lg p-1.5 -mx-1.5 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${config.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 leading-snug truncate">{event.description}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {event.person && <span className="font-medium">{event.person}</span>}
                    {event.unit && <span> · {event.unit}</span>}
                    {' · '}{formatRelative(event.time)}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
