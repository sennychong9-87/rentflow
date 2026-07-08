import { useState, useEffect } from 'react'
import { Users, Plus, Search, Mail, Phone, ExternalLink, Trash2, Copy, CheckCircle } from 'lucide-react'
import { useTenantStore } from '@/store/tenantStore'
import { usePropertyStore } from '@/store/propertyStore'
import { useAuth } from '@/hooks/useAuth'
import { cn, getInitials, getPortalUrl, TENANT_STATUS_STYLES, formatDate } from '@/lib/utils'
import EmptyState from '@/components/shared/EmptyState'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Link } from 'react-router-dom'

function AddTenantModal({ onClose, onSave, units }) {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', unit_id: '', status: 'active' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const vacantUnits = units.filter(u => u.status === 'vacant' || u.status === 'maintenance')

  const handleSave = async () => {
    if (!form.full_name || !form.email) { setError('Name and email are required'); return }
    setLoading(true)
    setError('')
    const { error } = await onSave(form)
    if (error) { setError(error); setLoading(false) }
    else { setLoading(false); onClose() }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-lg">Add tenant</h2>
          <p className="text-sm text-slate-500 mt-0.5">They'll get a private portal link to submit maintenance and check rent status.</p>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>}
          <div>
            <label className="label">Full name</label>
            <input className="input" placeholder="Jane Smith" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="jane@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className="label">Phone <span className="text-slate-400 font-normal">(optional)</span></label>
            <input className="input" type="tel" placeholder="+1 555 000 0000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div>
            <label className="label">Assign unit <span className="text-slate-400 font-normal">(optional)</span></label>
            <select className="input" value={form.unit_id} onChange={e => setForm(f => ({ ...f, unit_id: e.target.value }))}>
              <option value="">— Unassigned —</option>
              {vacantUnits.map(u => (
                <option key={u.id} value={u.id}>Unit {u.unit_number}</option>
              ))}
            </select>
            {vacantUnits.length === 0 && <p className="text-xs text-slate-400 mt-1">No vacant units — add a property first.</p>}
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="btn-primary">{loading ? 'Adding…' : 'Add tenant'}</button>
        </div>
      </div>
    </div>
  )
}

function TenantRow({ tenant, onDelete }) {
  const [copied, setCopied] = useState(false)
  const portalUrl = getPortalUrl(tenant.portal_token)

  const copyPortalLink = () => {
    navigator.clipboard.writeText(portalUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow">
      <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-sm font-semibold text-brand-700 flex-shrink-0">
        {getInitials(tenant.full_name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link to={`/dashboard/tenants/${tenant.id}`} className="text-sm font-semibold text-slate-900 hover:text-brand-600 transition-colors">
            {tenant.full_name}
          </Link>
          <span className={`badge ${TENANT_STATUS_STYLES[tenant.status]}`}>{tenant.status}</span>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-slate-400 flex items-center gap-1"><Mail className="w-3 h-3" />{tenant.email}</span>
          {tenant.phone && <span className="text-xs text-slate-400 flex items-center gap-1"><Phone className="w-3 h-3" />{tenant.phone}</span>}
        </div>
        {tenant.units && (
          <p className="text-xs text-slate-400 mt-0.5">Unit {tenant.units.unit_number} · {tenant.units.properties?.name}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={copyPortalLink} title="Copy portal link" className={cn('btn-ghost gap-1.5 text-xs', copied ? 'text-green-600' : '')}>
          {copied ? <><CheckCircle className="w-3.5 h-3.5" />Copied</> : <><Copy className="w-3.5 h-3.5" />Portal link</>}
        </button>
        <Link to={`/dashboard/tenants/${tenant.id}`} className="btn-ghost p-2">
          <ExternalLink className="w-4 h-4" />
        </Link>
        <button onClick={() => onDelete(tenant.id)} className="btn-ghost p-2 text-slate-400 hover:text-red-500">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function Tenants() {
  const { tenants, loading, fetchTenants, addTenant, deleteTenant } = useTenantStore()
  const { units, fetchProperties } = usePropertyStore()
  const { user } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchTenants(); fetchProperties() }, [])

  const filtered = tenants.filter(t => {
    const matchSearch = t.full_name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || t.status === filter
    return matchSearch && matchFilter
  })

  const handleAdd = async (form) => {
    return await addTenant({ ...form, landlord_id: user.id, unit_id: form.unit_id || null })
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this tenant?')) return
    await deleteTenant(id)
  }

  if (loading) return <LoadingSpinner className="py-20" />

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Tenants</h2>
          <p className="text-sm text-slate-500">{tenants.filter(t => t.status === 'active').length} active</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary gap-2">
          <Plus className="w-4 h-4" /> Add tenant
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="input pl-9" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-36" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="vacating">Vacating</option>
          <option value="vacated">Vacated</option>
        </select>
      </div>

      {tenants.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No tenants yet"
          description="Add your first tenant. They'll get a unique portal link — no app download needed."
          action={<button onClick={() => setShowModal(true)} className="btn-primary gap-2"><Plus className="w-4 h-4" />Add first tenant</button>}
        />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No tenants match your search.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => <TenantRow key={t.id} tenant={t} onDelete={handleDelete} />)}
        </div>
      )}

      {showModal && <AddTenantModal onClose={() => setShowModal(false)} onSave={handleAdd} units={units} />}
    </div>
  )
}
