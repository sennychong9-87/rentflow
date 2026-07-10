import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { usePropertyStore } from '@/store/propertyStore'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { PROPERTY_TYPES } from '@/lib/constants'
import { logEvent } from '@/hooks/useAuditLog'

/**
 * AddPropertyForm — 2-step form for adding a property + its units
 *
 * Usage:
 *   <AddPropertyForm
 *     onSuccess={() => { fetchProperties(); setShowForm(false) }}
 *     onCancel={() => setShowForm(false)}
 *   />
 */
export default function AddPropertyForm({ onSuccess, onCancel }) {
  const { user } = useAuth()
  const { addProperty } = usePropertyStore()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [property, setProperty] = useState({
    name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    property_type: 'residential',
  })

  const [units, setUnits] = useState([
    { unit_number: '', bedrooms: 1, bathrooms: 1, sq_ft: '', monthly_rent: '', deposit_amount: '' }
  ])

  const updateProperty = (field) => (e) =>
    setProperty(p => ({ ...p, [field]: e.target.value }))

  const updateUnit = (index, field) => (e) =>
    setUnits(prev => prev.map((u, i) => i === index ? { ...u, [field]: e.target.value } : u))

  const addUnit = () =>
    setUnits(prev => [...prev, { unit_number: '', bedrooms: 1, bathrooms: 1, sq_ft: '', monthly_rent: '', deposit_amount: '' }])

  const removeUnit = (index) =>
    setUnits(prev => prev.filter((_, i) => i !== index))

  const validateStep1 = () => {
    if (!property.name.trim()) { setError('Property name is required'); return false }
    if (!property.address_line1.trim()) { setError('Street address is required'); return false }
    if (!property.city.trim()) { setError('City is required'); return false }
    if (!property.state.trim()) { setError('State is required'); return false }
    return true
  }

  const handleNext = () => {
    setError('')
    if (validateStep1()) setStep(2)
  }

  const handleSave = async () => {
    setError('')
    setLoading(true)

    // 1. Create property
    const { data: prop, error: propErr } = await addProperty({
      ...property,
      landlord_id: user.id,
      total_units: units.filter(u => u.unit_number).length,
    })

    if (propErr || !prop) {
      setError(propErr || 'Failed to create property')
      setLoading(false)
      return
    }

    // 2. Create units
    const validUnits = units.filter(u => u.unit_number.trim())
    if (validUnits.length > 0) {
      const { error: unitErr } = await supabase.from('units').insert(
        validUnits.map(u => ({
          property_id: prop.id,
          landlord_id: user.id,
          unit_number: u.unit_number.trim(),
          bedrooms: Number(u.bedrooms) || 1,
          bathrooms: Number(u.bathrooms) || 1,
          sq_ft: u.sq_ft ? Number(u.sq_ft) : null,
          monthly_rent: parseFloat(u.monthly_rent) || 0,
          deposit_amount: parseFloat(u.deposit_amount) || 0,
          status: 'vacant',
        }))
      )
      if (unitErr) {
        setError('Property created but some units failed to save.')
        setLoading(false)
        return
      }
    }

    // 3. Auto-create Common Areas unit for HMO properties
    if (property.property_type === 'hmo') {
      await supabase.from('units').insert({
        property_id: prop.id,
        landlord_id: user.id,
        unit_number: 'common',
        is_common_area: true,
        monthly_rent: 0,
        deposit_amount: 0,
        status: 'occupied',
        bedrooms: 0,
        bathrooms: 0,
      })
    }

    // 4. Audit log
    logEvent(user.id, {
      entity_type: 'property',
      entity_id: prop.id,
      entity_label: prop.name,
      action: 'created',
      description: `Created property "${prop.name}"`,
    })

    setLoading(false)
    onSuccess?.()
  }

  return (
    <div className="space-y-5">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {['Property details', 'Units'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full transition-colors ${
              step === i + 1 ? 'bg-brand-500 text-white' : step > i + 1 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
            }`}>
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs bg-white/20">{i + 1}</span>
              {label}
            </div>
            {i < 1 && <span className="text-slate-200">→</span>}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Step 1 — Property details */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="label">Property name <span className="text-red-500">*</span></label>
            <input className="input" placeholder="e.g. Sunset Apartments" value={property.name} onChange={updateProperty('name')} />
          </div>
          <div>
            <label className="label">Street address <span className="text-red-500">*</span></label>
            <input className="input" placeholder="123 Main Street" value={property.address_line1} onChange={updateProperty('address_line1')} />
          </div>
          <div>
            <label className="label">Apt, suite, floor (optional)</label>
            <input className="input" placeholder="Suite 100" value={property.address_line2} onChange={updateProperty('address_line2')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">City <span className="text-red-500">*</span></label>
              <input className="input" placeholder="New York" value={property.city} onChange={updateProperty('city')} />
            </div>
            <div>
              <label className="label">State <span className="text-red-500">*</span></label>
              <input className="input" placeholder="NY" value={property.state} onChange={updateProperty('state')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">ZIP / Postal code</label>
              <input className="input" placeholder="10001" value={property.zip} onChange={updateProperty('zip')} />
            </div>
            <div>
              <label className="label">Property type</label>
              <select className="input" value={property.property_type} onChange={updateProperty('property_type')}>
                {PROPERTY_TYPES.map(pt => (
                  <option key={pt.value} value={pt.value}>{pt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 — Units */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Add all {property.property_type === 'hmo' ? 'rooms' : 'units'} in this property. You can skip the number to add them later.
          </p>

          {units.map((unit, i) => (
            <div key={i} className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">
                  {property.property_type === 'hmo' ? 'Room' : 'Unit'} {i + 1}
                </span>
                {units.length > 1 && (
                  <button
                    onClick={() => removeUnit(i)}
                    className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">{property.property_type === 'hmo' ? 'Room #' : 'Unit #'}</label>
                  <input className="input" placeholder="1A" value={unit.unit_number} onChange={updateUnit(i, 'unit_number')} />
                </div>
                <div>
                  <label className="label">Bedrooms</label>
                  <input className="input" type="number" min="0" max="20" value={unit.bedrooms} onChange={updateUnit(i, 'bedrooms')} />
                </div>
                <div>
                  <label className="label">Bathrooms</label>
                  <input className="input" type="number" min="0" max="20" step="0.5" value={unit.bathrooms} onChange={updateUnit(i, 'bathrooms')} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Sq ft</label>
                  <input className="input" type="number" placeholder="850" value={unit.sq_ft} onChange={updateUnit(i, 'sq_ft')} />
                </div>
                <div>
                  <label className="label">Monthly rent ($)</label>
                  <input className="input" type="number" placeholder="1500" value={unit.monthly_rent} onChange={updateUnit(i, 'monthly_rent')} />
                </div>
                <div>
                  <label className="label">Deposit ($)</label>
                  <input className="input" type="number" placeholder="3000" value={unit.deposit_amount} onChange={updateUnit(i, 'deposit_amount')} />
                </div>
              </div>
            </div>
          ))}

          <button onClick={addUnit} className="btn-secondary w-full gap-2">
            <Plus className="w-4 h-4" /> Add another {property.property_type === 'hmo' ? 'room' : 'unit'}
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
        <button onClick={onCancel} className="btn-secondary">Cancel</button>
        {step === 1 ? (
          <button onClick={handleNext} className="btn-primary">
            Next: Add units →
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="btn-secondary">← Back</button>
            <button onClick={handleSave} disabled={loading} className="btn-primary">
              {loading ? 'Saving…' : 'Save property'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
