import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useTenantStore } from '@/store/tenantStore'
import { usePropertyStore } from '@/store/propertyStore'

/**
 * AddTenantForm — standalone form for adding a tenant
 * Can be used inside a modal or inline
 *
 * Usage:
 *   <AddTenantForm
 *     onSuccess={(tenant) => console.log('Added:', tenant)}
 *     onCancel={() => setShowForm(false)}
 *   />
 */
export default function AddTenantForm({ onSuccess, onCancel }) {
  const { user } = useAuth()
  const { addTenant } = useTenantStore()
  const { units } = usePropertyStore()

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    unit_id: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    notes: '',
    status: 'active',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const vacantUnits = units.filter(u => u.status === 'vacant')

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async () => {
    setError('')
    if (!form.full_name.trim()) { setError('Full name is required'); return }
    if (!form.email.trim()) { setError('Email is required'); return }
    if (!/\S+@\S+\.\S+/.test(form.email)) { setError('Please enter a valid email'); return }

    setLoading(true)
    const { data, error: err } = await addTenant({
      ...form,
      landlord_id: user.id,
      unit_id: form.unit_id || null,
    })
    setLoading(false)

    if (err) { setError(err); return }
    onSuccess?.(data)
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Basic info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Full name <span className="text-red-500">*</span></label>
          <input className="input" placeholder="Jane Smith" value={form.full_name} onChange={update('full_name')} />
        </div>
        <div>
          <label className="label">Email <span className="text-red-500">*</span></label>
          <input className="input" type="email" placeholder="jane@example.com" value={form.email} onChange={update('email')} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Phone <span className="text-slate-400 font-normal">(optional)</span></label>
          <input className="input" type="tel" placeholder="+1 555 000 0000" value={form.phone} onChange={update('phone')} />
        </div>
        <div>
          <label className="label">Assign to unit <span className="text-slate-400 font-normal">(optional)</span></label>
          <select className="input" value={form.unit_id} onChange={update('unit_id')}>
            <option value="">— Unassigned —</option>
            {vacantUnits.map(u => (
              <option key={u.id} value={u.id}>Unit {u.unit_number}</option>
            ))}
          </select>
          {vacantUnits.length === 0 && (
            <p className="text-xs text-slate-400 mt-1">No vacant units available.</p>
          )}
        </div>
      </div>

      {/* Emergency contact */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Emergency contact <span className="text-slate-400 font-normal normal-case">(optional)</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Name</label>
            <input className="input" placeholder="John Smith" value={form.emergency_contact_name} onChange={update('emergency_contact_name')} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" type="tel" placeholder="+1 555 000 0000" value={form.emergency_contact_phone} onChange={update('emergency_contact_phone')} />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="label">Notes <span className="text-slate-400 font-normal">(optional)</span></label>
        <textarea
          className="input"
          rows={2}
          placeholder="Any notes about this tenant…"
          value={form.notes}
          onChange={update('notes')}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2">
        {onCancel && (
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
        <button onClick={handleSubmit} disabled={loading} className="btn-primary">
          {loading ? 'Adding tenant…' : 'Add tenant'}
        </button>
      </div>
    </div>
  )
}
