import { formatCurrency } from '@/lib/utils'
import { Link } from 'react-router-dom'

/**
 * RentStatusBar — visual rent collection progress
 *
 * Usage:
 *   <RentStatusBar
 *     totalDue={12000}
 *     totalCollected={9000}
 *     totalOutstanding={3000}
 *     paidCount={9}
 *     totalCount={12}
 *     lateCount={2}
 *     month="June"
 *     year={2026}
 *   />
 */
export default function RentStatusBar({
  totalDue = 0,
  totalCollected = 0,
  totalOutstanding = 0,
  paidCount = 0,
  totalCount = 0,
  lateCount = 0,
  month,
  year,
}) {
  const pct = totalDue > 0 ? Math.min(100, Math.round((totalCollected / totalDue) * 100)) : 0
  const latePct = totalDue > 0 ? Math.min(100 - pct, Math.round((totalOutstanding / totalDue) * 100)) : 0

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-900">
            Rent collection {month && `— ${month} ${year}`}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {paidCount} of {totalCount} tenants paid
          </p>
        </div>
        <Link to="/dashboard/rent" className="text-xs text-brand-600 hover:underline font-medium">
          View all →
        </Link>
      </div>

      {/* Stacked progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex mb-3">
        <div
          className="bg-green-500 h-3 rounded-l-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
        {latePct > 0 && (
          <div
            className="bg-red-400 h-3 transition-all duration-700"
            style={{ width: `${latePct}%` }}
          />
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
          <span className="text-slate-600">
            <span className="font-semibold text-green-600">{formatCurrency(totalCollected)}</span> collected
          </span>
        </div>

        {totalOutstanding > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 flex-shrink-0" />
            <span className="text-slate-600">
              <span className="font-semibold text-red-500">{formatCurrency(totalOutstanding)}</span> outstanding
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-200 flex-shrink-0" />
          <span className="text-slate-500">{formatCurrency(totalDue)} total due</span>
        </div>
      </div>

      {/* Late warning */}
      {lateCount > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-red-500 font-medium">
            ⚠ {lateCount} payment{lateCount > 1 ? 's' : ''} overdue
          </span>
          <span className="text-slate-400">{pct}% collected</span>
        </div>
      )}
    </div>
  )
}
