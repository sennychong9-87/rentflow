import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { formatDate, formatCurrency, getInitials, RENT_STATUS_STYLES, RENT_STATUS_LABELS } from '@/lib/utils'
import { MAINTENANCE_CATEGORIES, MAINTENANCE_PRIORITIES } from '@/lib/constants'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { logEvent } from '@/hooks/useAuditLog'
import { Zap, Home, DollarSign, Wrench, MessageSquare, FileText, Send, Plus, CheckCircle, AlertCircle } from 'lucide-react'

const TABS = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'rent', label: 'Rent', icon: DollarSign },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'documents', label: 'Documents', icon: FileText },
]

export default function TenantPortal() {
  const { token } = useParams()
  const [tenant, setTenant] = useState(null)
  const [lease, setLease] = useState(null)
  const [rentLedger, setRentLedger] = useState([])
  const [tickets, setTickets] = useState([])
  const [messages, setMessages] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('overview')
  const bottomRef = useRef(null)

  // Maintenance form
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [ticketForm, setTicketForm] = useState({ title: '', description: '', category: 'general', priority: 'medium', preferred_entry_time: '' })
  const [submittingTicket, setSubmittingTicket] = useState(false)
  const [ticketSuccess, setTicketSuccess] = useState(false)
  const [isSharedArea, setIsSharedArea] = useState('no')
  const isHmo = tenant?.units?.properties?.property_type === 'hmo'

  // Message input
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    loadPortal()
  }, [token])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadPortal = async () => {
    setLoading(true)
    const { data: t, error: tErr } = await supabase
      .from('tenants').select('*, units(*, properties(*))').eq('portal_token', token).single()
    if (tErr || !t) { setError('Portal link not found or expired.'); setLoading(false); return }
    setTenant(t)

    // Update last accessed
    await supabase.from('tenants').update({ portal_last_accessed: new Date().toISOString() }).eq('portal_token', token)

    const [{ data: l }, { data: r }, { data: m }, { data: msgs }, { data: docs }] = await Promise.all([
      supabase.from('leases').select('*').eq('tenant_id', t.id).eq('status', 'active').single(),
      supabase.from('rent_ledger').select('*').eq('tenant_id', t.id).order('period_year', { ascending: false }).order('period_month', { ascending: false }).limit(6),
      supabase.from('maintenance').select('*').eq('tenant_id', t.id).order('created_at', { ascending: false }),
      supabase.from('messages').select('*').eq('tenant_id', t.id).order('created_at', { ascending: true }),
      supabase.from('documents').select('*').eq('tenant_id', t.id).eq('visible_to_tenant', true),
    ])

    setLease(l); setRentLedger(r || []); setTickets(m || [])
    setMessages(msgs || []); setDocuments(docs || [])
    setLoading(false)

    // Log portal access
    logEvent(t.landlord_id, {
      entity_type: 'portal',
      entity_id: t.id,
      entity_label: t.full_name,
      action: 'accessed',
      description: `${t.full_name} accessed the tenant portal`,
    })
  }

  const submitTicket = async () => {
    if (!ticketForm.title || !ticketForm.description) return
    setSubmittingTicket(true)
    const commonUnitId = isHmo && isSharedArea === 'yes'
      ? tenant.units?.properties?.units?.find(u => u.is_common_area)?.id
      : null
    const { data: newTicket } = await supabase.from('maintenance').insert({
      landlord_id: tenant.units?.properties?.landlord_id || tenant.landlord_id,
      tenant_id: tenant.id,
      unit_id: commonUnitId || tenant.unit_id,
      ...ticketForm,
      submitted_by: 'tenant',
      is_shared_area: isHmo && isSharedArea === 'yes',
    }).select().single()
    if (newTicket) setTickets(prev => [newTicket, ...prev])
    setTicketSuccess(true)
    setShowTicketForm(false)
    setIsSharedArea('no')
    setTicketForm({ title: '', description: '', category: 'general', priority: 'medium', preferred_entry_time: '' })
    setTimeout(() => setTicketSuccess(false), 4000)
    setSubmittingTicket(false)
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    setSendingMessage(true)
    const { data: msg } = await supabase.from('messages').insert({
      landlord_id: tenant.units?.properties?.landlord_id || tenant.landlord_id,
      tenant_id: tenant.id,
      sender: 'tenant',
      body: newMessage.trim(),
    }).select().single()
    if (msg) setMessages(prev => [...prev, msg])
    setNewMessage('')
    setSendingMessage(false)
  }

  if (loading) return <LoadingSpinner fullScreen />

  if (error) return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
      <div className="text-center card p-10 max-w-sm">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h2 className="font-bold text-slate-900 mb-1">Link not found</h2>
        <p className="text-sm text-slate-500">{error}</p>
      </div>
    </div>
  )

  const currentMonth = rentLedger[0]
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress')

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-sm">RentFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700">
              {getInitials(tenant.full_name)}
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">{tenant.full_name}</span>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Property info */}
        <div className="card p-5">
          <p className="text-xs text-slate-400 mb-1">Your unit</p>
          <h1 className="text-xl font-bold text-slate-900">{tenant.units?.properties?.name}</h1>
          <p className="text-sm text-slate-500">Unit {tenant.units?.unit_number} · {tenant.units?.properties?.address_line1}, {tenant.units?.properties?.city}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide bg-white rounded-xl border border-slate-100 p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${tab === id ? 'bg-brand-500 text-white' : 'text-slate-500 hover:text-slate-800'}`}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {tab === 'overview' && (
          <div className="space-y-4">
            {currentMonth && (
              <div className={`card p-5 ${currentMonth.status === 'paid' ? 'border-green-200 bg-green-50' : currentMonth.status === 'late' ? 'border-red-200 bg-red-50' : ''}`}>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">This month's rent</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-slate-900">{formatCurrency(currentMonth.rent_due)}</p>
                    <p className="text-sm text-slate-500 mt-0.5">Due {new Date(currentMonth.period_year, currentMonth.period_month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                  </div>
                  <span className={`badge text-sm px-3 py-1 ${RENT_STATUS_STYLES[currentMonth.status]}`}>{RENT_STATUS_LABELS[currentMonth.status]}</span>
                </div>
                {currentMonth.balance > 0 && (
                  <p className="text-sm text-red-600 mt-3 font-medium">{formatCurrency(currentMonth.balance)} outstanding</p>
                )}
              </div>
            )}
            {lease && (
              <div className="card p-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Lease</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Monthly rent', value: formatCurrency(lease.monthly_rent) },
                    { label: 'Due day', value: `${lease.rent_due_day}${['st','nd','rd'][lease.rent_due_day-1]||'th'} of month` },
                    { label: 'Lease start', value: formatDate(lease.start_date) },
                    { label: 'Lease end', value: lease.end_date ? formatDate(lease.end_date) : 'Month-to-month' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {openTickets.length > 0 && (
              <div className="card p-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Open maintenance</p>
                <div className="space-y-2">
                  {openTickets.slice(0, 3).map(t => (
                    <div key={t.id} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">{t.title}</span>
                      <span className="text-xs text-slate-400 capitalize">{t.status.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rent tab */}
        {tab === 'rent' && (
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Rent history</h3>
            {rentLedger.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">No rent records yet.</div>
            ) : rentLedger.map(r => (
              <div key={r.id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {new Date(r.period_year, r.period_month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </p>
                  {r.payment_date && <p className="text-xs text-slate-400 mt-0.5">Paid {formatDate(r.payment_date)}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${RENT_STATUS_STYLES[r.status]}`}>{RENT_STATUS_LABELS[r.status]}</span>
                  <span className="text-sm font-bold text-slate-900">{formatCurrency(r.rent_due)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Maintenance tab */}
        {tab === 'maintenance' && (
          <div className="space-y-4">
            {ticketSuccess && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
                <CheckCircle className="w-4 h-4" /> Ticket submitted — your landlord has been notified.
              </div>
            )}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Maintenance requests</h3>
              <button onClick={() => setShowTicketForm(true)} className="btn-primary gap-2 text-xs">
                <Plus className="w-3.5 h-3.5" /> New request
              </button>
            </div>

            {showTicketForm && (
              <div className="card p-5 space-y-4 border-brand-200 border">
                <h4 className="font-semibold text-slate-900">Submit a request</h4>
                <div>
                  <label className="label">What's the issue?</label>
                  <input className="input" placeholder="e.g. Kitchen tap is dripping" value={ticketForm.title}
                    onChange={e => setTicketForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Describe the problem</label>
                  <textarea className="input" rows={3} placeholder="Please describe what's happening in detail…" value={ticketForm.description}
                    onChange={e => setTicketForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Category</label>
                    <select className="input" value={ticketForm.category} onChange={e => setTicketForm(f => ({ ...f, category: e.target.value }))}>
                      {MAINTENANCE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Urgency</label>
                    <select className="input" value={ticketForm.priority} onChange={e => setTicketForm(f => ({ ...f, priority: e.target.value }))}>
                      {MAINTENANCE_PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                </div>
                {isHmo && (
                  <div>
                    <label className="label">Is this about a shared area?</label>
                    <select className="input" value={isSharedArea} onChange={e => setIsSharedArea(e.target.value)}>
                      <option value="no">No — my room</option>
                      <option value="yes">Yes — kitchen, bathroom, living room, etc.</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="label">Preferred entry time <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input className="input" placeholder="e.g. Mornings, after 5pm, anytime" value={ticketForm.preferred_entry_time}
                    onChange={e => setTicketForm(f => ({ ...f, preferred_entry_time: e.target.value }))} />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowTicketForm(false)} className="btn-secondary flex-1">Cancel</button>
                  <button onClick={submitTicket} disabled={submittingTicket || !ticketForm.title || !ticketForm.description} className="btn-primary flex-1">
                    {submittingTicket ? 'Submitting…' : 'Submit request'}
                  </button>
                </div>
              </div>
            )}

            {tickets.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">No maintenance requests yet.</div>
            ) : tickets.map(t => (
              <div key={t.id} className="card p-4">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-semibold text-slate-900">{t.title}</p>
                  <span className="text-xs text-slate-400 capitalize flex-shrink-0 ml-2">{t.status.replace('_', ' ')}</span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{t.description}</p>
                <p className="text-xs text-slate-400 mt-2">{formatDate(t.created_at)} · {t.category}</p>
                {t.resolution_notes && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs font-medium text-green-700 mb-1">Resolution</p>
                    <p className="text-xs text-slate-600">{t.resolution_notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Messages tab */}
        {tab === 'messages' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Messages</h3>
            <div className="card overflow-hidden">
              <div className="p-4 space-y-3 min-h-48 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">No messages yet. Send a message to your landlord.</div>
                ) : messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'tenant' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${msg.sender === 'tenant' ? 'bg-brand-500 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}>
                      <p>{msg.body}</p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="border-t border-slate-100 p-3 flex gap-2">
                <input className="input flex-1 text-sm" placeholder="Send a message…" value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()} />
                <button onClick={sendMessage} disabled={sendingMessage || !newMessage.trim()} className="btn-primary px-3">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Documents tab */}
        {tab === 'documents' && (
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Shared documents</h3>
            {documents.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">No documents shared with you yet.</div>
            ) : documents.map(doc => (
              <div key={doc.id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">{doc.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDate(doc.created_at)} · {doc.category}</p>
                </div>
                {doc.public_url && (
                  <a href={doc.public_url} target="_blank" rel="noreferrer" className="btn-secondary text-xs gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> View
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-slate-300 pb-4">Powered by RentFlow</p>
      </div>
    </div>
  )
}
