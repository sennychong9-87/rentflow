import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, Copy, CheckCircle, Home, DollarSign, Wrench, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatCurrency, getInitials, getPortalUrl, TENANT_STATUS_STYLES, RENT_STATUS_STYLES, RENT_STATUS_LABELS, TICKET_STATUS_STYLES, PRIORITY_STYLES } from '@/lib/utils'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

export default function TenantDetail() {
  const { id } = useParams()
  const [tenant, setTenant] = useState(null)
  const [leases, setLeases] = useState([])
  const [rentLedger, setRentLedger] = useState([])
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    async function load() {
      const [{ data: t }, { data: l }, { data: r }, { data: m }] = await Promise.all([
        supabase.from('tenants').select('*, units(*, properties(*))').eq('id', id).single(),
        supabase.from('leases').select('*').eq('tenant_id', id).order('created_at', { ascending: false }),
        supabase.from('rent_ledger').select('*').eq('tenant_id', id).order('period_year', { ascending: false }).order('period_month', { ascending: false }).limit(12),
        supabase.from('maintenance').select('*').eq('tenant_id', id).order('created_at', { ascending: false }).limit(10),
      ])
      setTenant(t); setLeases(l || []); setRentLedger(r || []); setTickets(m || [])
      setLoading(false)
    }
    load()
  }, [id])

  const copyLink = () => {
    navigator.clipboard.writeText(getPortalUrl(tenant.portal_token))
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <LoadingSpinner className="py-20" />
  if (!tenant) return <div className="text-center py-20 text-slate-400">Tenant not found.</div>

  const activeLease = leases.find(l => l.status === 'active')
  const tabs = ['overview', 'rent history', 'maintenance']

  return (
    <div className="max-w-3xl space-y-6">
      <Link to="/dashboard/tenants" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to tenants
      </Link>

      {/* Header card */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center text-lg font-bold text-brand-700">
              {getInitials(tenant.full_name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{tenant.full_name}</h2>
                <span className={`badge ${TENANT_STATUS_STYLES[tenant.status]}`}>{tenant.status}</span>
              </div>
              <div className="flex items-center gap-4 mt-1">
                <a href={`mailto:${tenant.email}`} className="text-sm text-slate-500 hover:text-brand-600 flex items-center gap-1.5 transition-colors">
                  <Mail className="w-3.5 h-3.5" />{tenant.email}
                </a>
                {tenant.phone && (
                  <a href={`tel:${tenant.phone}`} className="text-sm text-slate-500 hover:text-brand-600 flex items-center gap-1.5 transition-colors">
                    <Phone className="w-3.5 h-3.5" />{tenant.phone}
                  </a>
                )}
              </div>
              {tenant.units && (
                <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1">
                  <Home className="w-3.5 h-3.5" />
                  Unit {tenant.units.unit_number} · {tenant.units.properties?.name}
                </p>
              )}
            </div>
          </div>
          <button onClick={copyLink} className={`btn-secondary gap-2 text-xs ${copied ? 'text-green-600 border-green-200' : ''}`}>
            {copied ? <><CheckCircle className="w-3.5 h-3.5" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Portal link</>}
          </button>
        </div>
      </div>

      {/* Lease info */}
      {activeLease && (
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4 text-brand-500" />Active lease</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Monthly rent', value: formatCurrency(activeLease.monthly_rent) },
              { label: 'Deposit', value: formatCurrency(activeLease.deposit_amount) },
              { label: 'Start date', value: formatDate(activeLease.start_date) },
              { label: 'End date', value: activeLease.end_date ? formatDate(activeLease.end_date) : 'Month-to-month' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-slate-800">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div>
        <div className="flex gap-1 border-b border-slate-100 mb-4">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${activeTab === tab ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="card divide-y divide-slate-50">
            {[
              { label: 'Tenant since', value: formatDate(tenant.created_at) },
              { label: 'Portal last accessed', value: tenant.portal_last_accessed ? formatDate(tenant.portal_last_accessed) : 'Never' },
              { label: 'Emergency contact', value: tenant.emergency_contact_name || '—' },
              { label: 'Emergency phone', value: tenant.emergency_contact_phone || '—' },
              { label: 'Notes', value: tenant.notes || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-slate-500">{label}</span>
                <span className="text-sm font-medium text-slate-800">{value}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'rent history' && (
          <div className="space-y-2">
            {rentLedger.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">No rent records yet.</div>
            ) : rentLedger.map(r => (
              <div key={r.id} className="card px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">{new Date(r.period_year, r.period_month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                  {r.payment_date && <p className="text-xs text-slate-400">Paid {formatDate(r.payment_date)}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${RENT_STATUS_STYLES[r.status]}`}>{RENT_STATUS_LABELS[r.status]}</span>
                  <span className="text-sm font-semibold text-slate-700">{formatCurrency(r.rent_paid)} / {formatCurrency(r.rent_due)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="space-y-2">
            {tickets.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">No maintenance tickets.</div>
            ) : tickets.map(t => (
              <div key={t.id} className="card px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">{t.title}</p>
                  <p className="text-xs text-slate-400">{formatDate(t.created_at)} · {t.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${PRIORITY_STYLES[t.priority]}`}>{t.priority}</span>
                  <span className={`badge ${TICKET_STATUS_STYLES[t.status]}`}>{t.status.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
