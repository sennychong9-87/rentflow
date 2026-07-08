import { useState, useEffect } from 'react'
import { Building2, Plus, Home, MoreVertical, MapPin, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { usePropertyStore } from '@/store/propertyStore'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency, cn, UNIT_STATUS_STYLES } from '@/lib/utils'
import EmptyState from '@/components/shared/EmptyState'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

function AddPropertyModal({ onClose, onSave }) {
  const [step, setStep] = useState(1) // 1=property, 2=units
  const [property, setProperty] = useState({ name: '', address_line1: '', city: '', state: '', zip: '', country: 'US', property_type: 'residential' })
  const [units, setUnits] = useState([{ unit_number: '', bedrooms: 1, bathrooms: 1, monthly_rent: '', deposit_amount: '' }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addUnit = () => setUnits(u => [...u, { unit_number: '', bedrooms: 1, bathrooms: 1, monthly_rent: '', deposit_amount: '' }])
  const removeUnit = (i) => setUnits(u => u.filter((_, idx) => idx !== i))
  const updateUnit = (i, field, val) => setUnits(u => u.map((u2, idx) => idx === i ? { ...u2, [field]: val } : u2))

  const handleSave = async () => {
    setLoading(true)
    setError('')
    await onSave(property, units)
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-lg">Add property</h2>
          <div className="flex gap-2 mt-3">
            {['Property details', 'Units'].map((s, i) => (
              <div key={s} className={cn('flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full', step === i + 1 ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-500')}>
                <span className={cn('w-4 h-4 rounded-full flex items-center justify-center text-xs', step === i + 1 ? 'bg-white/20' : 'bg-white')}>{i + 1}</span>
                {s}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>}

          {step === 1 && (
            <>
              <div>
                <label className="label">Property name</label>
                <input className="input" placeholder="e.g. Sunset Apartments" value={property.name} onChange={e => setProperty(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="label">Street address</label>
                <input className="input" placeholder="123 Main Street" value={property.address_line1} onChange={e => setProperty(p => ({ ...p, address_line1: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">City</label>
                  <input className="input" placeholder="New York" value={property.city} onChange={e => setProperty(p => ({ ...p, city: e.target.value }))} />
                </div>
                <div>
                  <label className="label">State</label>
                  <input className="input" placeholder="NY" value={property.state} onChange={e => setProperty(p => ({ ...p, state: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">ZIP code</label>
                  <input className="input" placeholder="10001" value={property.zip} onChange={e => setProperty(p => ({ ...p, zip: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Type</label>
                  <select className="input" value={property.property_type} onChange={e => setProperty(p => ({ ...p, property_type: e.target.value }))}>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="mixed">Mixed use</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {units.map((unit, i) => (
                <div key={i} className="border border-slate-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Unit {i + 1}</span>
                    {units.length > 1 && (
                      <button onClick={() => removeUnit(i)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="label">Unit #</label>
                      <input className="input" placeholder="1A" value={unit.unit_number} onChange={e => updateUnit(i, 'unit_number', e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Beds</label>
                      <input className="input" type="number" min="0" value={unit.bedrooms} onChange={e => updateUnit(i, 'bedrooms', +e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Baths</label>
                      <input className="input" type="number" min="0" step="0.5" value={unit.bathrooms} onChange={e => updateUnit(i, 'bathrooms', +e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Monthly rent ($)</label>
                      <input className="input" type="number" placeholder="1500" value={unit.monthly_rent} onChange={e => updateUnit(i, 'monthly_rent', e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Deposit ($)</label>
                      <input className="input" type="number" placeholder="3000" value={unit.deposit_amount} onChange={e => updateUnit(i, 'deposit_amount', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addUnit} className="btn-secondary w-full gap-2">
                <Plus className="w-4 h-4" /> Add another unit
              </button>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          {step === 1
            ? <button onClick={() => setStep(2)} disabled={!property.name || !property.address_line1 || !property.city} className="btn-primary">Next: Add units</button>
            : <button onClick={handleSave} disabled={loading} className="btn-primary">{loading ? 'Saving…' : 'Save property'}</button>
          }
        </div>
      </div>
    </div>
  )
}

function PropertyCard({ property, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const units = property.units || []
  const occupied = units.filter(u => u.status === 'occupied').length
  const totalRent = units.reduce((sum, u) => sum + (u.monthly_rent || 0), 0)

  return (
    <div className="card overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{property.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400">
                <MapPin className="w-3 h-3" />
                {property.address_line1}, {property.city}, {property.state}
              </div>
            </div>
          </div>
          <button onClick={() => onDelete(property.id)} className="btn-ghost text-slate-400 hover:text-red-500 p-1.5">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-50">
          <div>
            <p className="text-xs text-slate-400">Units</p>
            <p className="text-lg font-bold text-slate-900">{units.length}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Occupied</p>
            <p className="text-lg font-bold text-slate-900">{occupied}/{units.length}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Monthly rent</p>
            <p className="text-lg font-bold text-slate-900">{formatCurrency(totalRent)}</p>
          </div>
        </div>
      </div>

      {units.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <span>{units.length} unit{units.length !== 1 ? 's' : ''}</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expanded && (
            <div className="divide-y divide-slate-50">
              {units.map(unit => (
                <div key={unit.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Home className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">Unit {unit.unit_number}</p>
                      <p className="text-xs text-slate-400">{unit.bedrooms}bd · {unit.bathrooms}ba</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${UNIT_STATUS_STYLES[unit.status]}`}>{unit.status}</span>
                    <span className="text-sm font-semibold text-slate-700">{formatCurrency(unit.monthly_rent)}/mo</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function Properties() {
  const { properties, loading, fetchProperties, addProperty, deleteProperty } = usePropertyStore()
  const { user } = useAuth()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { fetchProperties() }, [])

  const handleSave = async (propertyData, unitsData) => {
    const { data, error } = await addProperty({ ...propertyData, landlord_id: user.id })
    if (error || !data) return
    // Add units
    const { supabase } = await import('@/lib/supabase')
    for (const unit of unitsData) {
      if (!unit.unit_number) continue
      await supabase.from('units').insert({
        ...unit,
        property_id: data.id,
        landlord_id: user.id,
        monthly_rent: parseFloat(unit.monthly_rent) || 0,
        deposit_amount: parseFloat(unit.deposit_amount) || 0,
      })
    }
    fetchProperties()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this property and all its units?')) return
    await deleteProperty(id)
  }

  if (loading) return <LoadingSpinner className="py-20" />

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Properties</h2>
          <p className="text-sm text-slate-500">{properties.length} propert{properties.length !== 1 ? 'ies' : 'y'}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary gap-2">
          <Plus className="w-4 h-4" /> Add property
        </button>
      </div>

      {properties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No properties yet"
          description="Add your first property to start managing units and tenants."
          action={<button onClick={() => setShowModal(true)} className="btn-primary gap-2"><Plus className="w-4 h-4" />Add your first property</button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {properties.map(p => <PropertyCard key={p.id} property={p} onDelete={handleDelete} />)}
        </div>
      )}

      {showModal && <AddPropertyModal onClose={() => setShowModal(false)} onSave={handleSave} />}
    </div>
  )
}
