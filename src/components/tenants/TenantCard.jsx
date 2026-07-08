import { Link } from 'react-router-dom'
import { Mail, Phone, Copy, CheckCircle, Home } from 'lucide-react'
import { useState } from 'react'
import { getInitials, getPortalUrl, TENANT_STATUS_STYLES } from '@/lib/utils'
import { cn } from '@/lib/utils'

/**
 * TenantCard — summary card for a single tenant
 *
 * Usage:
 *   <TenantCard tenant={tenant} onDelete={handleDelete} />
 */
export default function TenantCard({ tenant, onDelete }) {
  const [copied, setCopied] = useState(false)

  const copyPortalLink = (e) => {
    e.preventDefault()
    navigator.clipboard.writeText(getPortalUrl(tenant.portal_token))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-card p-5 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Link to={`/dashboard/tenants/${tenant.id}`}>
          <div className="w-11 h-11 rounded-full bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-700 flex-shrink-0 hover:ring-2 hover:ring-brand-300 transition-all">
            {getInitials(tenant.full_name)}
          </div>
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/dashboard/tenants/${tenant.id}`}
              className="font-semibold text-slate-900 hover:text-brand-600 transition-colors"
            >
              {tenant.full_name}
            </Link>
            <span className={`badge ${TENANT_STATUS_STYLES[tenant.status]}`}>
              {tenant.status}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <a
              href={`mailto:${tenant.email}`}
              className="text-xs text-slate-400 hover:text-brand-600 flex items-center gap-1 transition-colors"
            >
              <Mail className="w-3 h-3" />{tenant.email}
            </a>
            {tenant.phone && (
              <a
                href={`tel:${tenant.phone}`}
                className="text-xs text-slate-400 hover:text-brand-600 flex items-center gap-1 transition-colors"
              >
                <Phone className="w-3 h-3" />{tenant.phone}
              </a>
            )}
          </div>

          {tenant.units && (
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <Home className="w-3 h-3" />
              Unit {tenant.units.unit_number}
              {tenant.units.properties?.name && ` · ${tenant.units.properties.name}`}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
        <button
          onClick={copyPortalLink}
          className={cn(
            'btn-ghost text-xs flex-1 gap-1.5 justify-center',
            copied ? 'text-green-600' : 'text-slate-500'
          )}
        >
          {copied
            ? <><CheckCircle className="w-3.5 h-3.5" />Copied!</>
            : <><Copy className="w-3.5 h-3.5" />Copy portal link</>
          }
        </button>

        <Link
          to={`/dashboard/tenants/${tenant.id}`}
          className="btn-secondary text-xs px-3 py-1.5"
        >
          View profile
        </Link>

        {onDelete && (
          <button
            onClick={() => onDelete(tenant.id)}
            className="btn-ghost text-xs text-red-400 hover:text-red-600 px-2"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  )
}
