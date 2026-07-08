import { AlertCircle, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react'
import { formatRelative, PRIORITY_STYLES, PRIORITY_LABELS, TICKET_STATUS_STYLES } from '@/lib/utils'
import { cn } from '@/lib/utils'

const STATUS_ICONS = {
  open:        { icon: AlertCircle, color: 'text-blue-500' },
  in_progress: { icon: Clock,       color: 'text-yellow-500' },
  resolved:    { icon: CheckCircle, color: 'text-green-500' },
  closed:      { icon: XCircle,     color: 'text-slate-400' },
}

/**
 * TicketCard — single maintenance ticket card
 *
 * Usage:
 *   <TicketCard ticket={ticket} onClick={() => setSelected(ticket)} />
 */
export default function TicketCard({ ticket, onClick }) {
  const statusConfig = STATUS_ICONS[ticket.status] || STATUS_ICONS.open
  const StatusIcon = statusConfig.icon

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl border border-slate-100 shadow-card p-4 text-left hover:shadow-card-hover transition-shadow"
    >
      <div className="flex items-start gap-3">
        {/* Status icon */}
        <StatusIcon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', statusConfig.color)} />

        <div className="flex-1 min-w-0">
          {/* Priority + category */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`badge ${PRIORITY_STYLES[ticket.priority]}`}>
              {PRIORITY_LABELS[ticket.priority]}
            </span>
            <span className="text-xs text-slate-400 capitalize">{ticket.category}</span>
          </div>

          {/* Title */}
          <p className="text-sm font-semibold text-slate-900 truncate">{ticket.title}</p>

          {/* Description */}
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{ticket.description}</p>

          {/* Meta */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {ticket.tenants?.full_name && (
              <span className="text-xs text-slate-400">{ticket.tenants.full_name}</span>
            )}
            {ticket.units?.unit_number && (
              <span className="text-xs text-slate-400">· Unit {ticket.units.unit_number}</span>
            )}
            <span className="text-xs text-slate-400">· {formatRelative(ticket.created_at)}</span>
          </div>

          {/* Resolution note if resolved */}
          {ticket.resolution_notes && (
            <div className="mt-2 pt-2 border-t border-slate-100">
              <p className="text-xs text-green-700 line-clamp-1">
                ✓ {ticket.resolution_notes}
              </p>
            </div>
          )}
        </div>

        {/* Status badge + chevron */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`badge ${TICKET_STATUS_STYLES[ticket.status]}`}>
            {ticket.status.replace('_', ' ')}
          </span>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </div>
      </div>
    </button>
  )
}
