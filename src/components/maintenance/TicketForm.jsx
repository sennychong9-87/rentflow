import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { MAINTENANCE_CATEGORIES, MAINTENANCE_PRIORITIES } from '@/lib/constants'
import { CheckCircle } from 'lucide-react'

/**
 * TicketForm — used in the Tenant Portal for submitting maintenance requests
 * Also usable by landlords to log issues directly
 *
 * Usage:
 *   <TicketForm
 *     tenantId={tenant.id}
 *     landlordId={tenant.landlord_id}
 *     unitId={tenant.unit_id}
 *     onSuccess={(ticket) => console.log('Created:', ticket)}
 *     onCancel={() => setShowForm(false)}
 *   />
 */
export default function TicketForm({
  tenantId,
  landlordId,
  unitId,
  submittedBy = 'tenant',  // 'tenant' | 'landlord'
  onSuccess,
  onCancel,
}) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium',
    preferred_entry_time: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async () => {
    setError('')
    if (!form.title.trim()) { setError('Please enter a title for the issue'); return }
    if (!form.description.trim()) { setError('Please describe the problem'); return }

    setLoading(true)

    const { data, error: err } = await supabase
      .from('maintenance')
      .insert({
        landlord_id: landlordId,
        tenant_id: tenantId,
        unit_id: unitId,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.priority,
        preferred_entry_time: form.preferred_entry_time || null,
        submitted_by: submittedBy,
        status: 'open',
      })
      .select()
      .single()

    setLoading(false)

    if (err) { setError(err.message); return }

    setSuccess(true)
    onSuccess?.(data)

    // Reset form after 2 seconds
    setTimeout(() => {
      setSuccess(false)
      setForm({ title: '', description: '', category: 'general', priority: 'medium', preferred_entry_time: '' })
    }, 2000)
  }

  if (success) return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
        <CheckCircle className="w-6 h-6 text-green-600" />
      </div>
      <p className="font-semibold text-slate-900">Request submitted</p>
      <p className="text-sm text-slate-500 mt-1">Your landlord has been notified and will respond shortly.</p>
    </div>
  )

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="label">What's the issue? <span className="text-red-500">*</span></label>
        <input
          className="input"
          placeholder="e.g. Kitchen tap is dripping"
          value={form.title}
          onChange={update('title')}
        />
      </div>

      <div>
        <label className="label">Describe the problem <span className="text-red-500">*</span></label>
        <textarea
          className="input"
          rows={4}
          placeholder="Please describe what's happening, where it is, and how long it's been an issue…"
          value={form.description}
          onChange={update('description')}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Category</label>
          <select className="input" value={form.category} onChange={update('category')}>
            {MAINTENANCE_CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Urgency</label>
          <select className="input" value={form.priority} onChange={update('priority')}>
            {MAINTENANCE_PRIORITIES.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Show description for selected priority */}
      {form.priority && (
        <p className="text-xs text-slate-400 -mt-2">
          {MAINTENANCE_PRIORITIES.find(p => p.value === form.priority)?.description}
        </p>
      )}

      <div>
        <label className="label">
          Preferred entry time{' '}
          <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <input
          className="input"
          placeholder="e.g. Mornings, after 5pm, weekends only, anytime"
          value={form.preferred_entry_time}
          onChange={update('preferred_entry_time')}
        />
      </div>

      <div className="flex gap-3 justify-end pt-1">
        {onCancel && (
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading || !form.title || !form.description}
          className="btn-primary"
        >
          {loading ? 'Submitting…' : 'Submit request'}
        </button>
      </div>
    </div>
  )
}
