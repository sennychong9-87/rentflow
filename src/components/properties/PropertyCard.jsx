import { useState } from 'react'
import { Building2, MapPin, Home, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { formatCurrency, UNIT_STATUS_STYLES } from '@/lib/utils'

/**
 * PropertyCard — displays a property and its units
 *
 * Usage:
 *   <PropertyCard property={property} onDelete={handleDelete} />
 */
export default function PropertyCard({ property, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const units = property.units || []
  const occupied = units.filter(u => u.status === 'occupied').length
  const vacant = units.filter(u => u.status === 'vacant').length
  const totalRent = units.reduce((sum, u) => sum + (Number(u.monthly_rent) || 0), 0)
  const occupancyPct = units.length > 0 ? Math.round((occupied / units.length) * 100) : 0

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-card overflow-hidden">
      {/* Header */}
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
                {property.zip && ` ${property.zip}`}
              </div>
              <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-500 capitalize">
                {property.property_type || 'residential'}
              </span>
            </div>
          </div>

          {onDelete && (
            <button
              onClick={() => onDelete(property.id)}
              className="btn-ghost p-1.5 text-slate-400 hover:text-red-500"
              title="Delete property"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-50">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Total units</p>
            <p className="text-xl font-bold text-slate-900">{units.length}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Occupied</p>
            <p className="text-xl font-bold text-slate-900">
              {occupied}
              <span className="text-sm font-normal text-slate-400">/{units.length}</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Monthly rent</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(totalRent)}</p>
          </div>
        </div>

        {/* Occupancy bar */}
        {units.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Occupancy</span>
              <span>{occupancyPct}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-brand-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${occupancyPct}%` }}
              />
            </div>
            {vacant > 0 && (
              <p className="text-xs text-slate-400 mt-1.5">
                {vacant} unit{vacant > 1 ? 's' : ''} vacant
              </p>
            )}
          </div>
        )}
      </div>

      {/* Units toggle */}
      {units.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors border-t border-slate-100"
          >
            <span>{units.length} unit{units.length !== 1 ? 's' : ''}</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expanded && (
            <div className="divide-y divide-slate-50">
              {units.map(unit => (
                <div key={unit.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Home className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">Unit {unit.unit_number}</p>
                      <p className="text-xs text-slate-400">
                        {unit.bedrooms}bd · {unit.bathrooms}ba
                        {unit.sq_ft ? ` · ${unit.sq_ft} sq ft` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${UNIT_STATUS_STYLES[unit.status]}`}>
                      {unit.status}
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {formatCurrency(unit.monthly_rent)}/mo
                    </span>
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
