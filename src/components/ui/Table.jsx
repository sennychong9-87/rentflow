import { cn } from '@/lib/utils'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

/**
 * Table component
 *
 * Usage:
 *   <Table
 *     columns={[
 *       { key: 'name', label: 'Name', sortable: true },
 *       { key: 'status', label: 'Status', align: 'center' },
 *       { key: 'amount', label: 'Amount', align: 'right', render: (v) => formatCurrency(v) },
 *       { key: 'actions', label: '', render: (_, row) => <button>Edit</button> },
 *     ]}
 *     data={tenants}
 *     sortKey="name"
 *     sortDir="asc"
 *     onSort={(key) => handleSort(key)}
 *     onRowClick={(row) => navigate(`/tenants/${row.id}`)}
 *     emptyMessage="No tenants yet"
 *   />
 */
export default function Table({
  columns = [],
  data = [],
  sortKey,
  sortDir = 'asc',
  onSort,
  onRowClick,
  loading = false,
  emptyMessage = 'No data yet',
  className,
}) {
  const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' }

  return (
    <div className={cn('card overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {/* Head */}
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap',
                    alignClass[col.align || 'left'],
                    col.sortable && 'cursor-pointer hover:text-slate-800 select-none'
                  )}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      sortKey === col.key
                        ? sortDir === 'asc'
                          ? <ChevronUp className="w-3 h-3" />
                          : <ChevronDown className="w-3 h-3" />
                        : <ChevronsUpDown className="w-3 h-3 opacity-40" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12">
                  <div className="inline-flex items-center gap-2 text-slate-400 text-sm">
                    <span className="w-4 h-4 rounded-full border-2 border-slate-200 border-t-brand-500 animate-spin" />
                    Loading…
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-slate-400 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'hover:bg-slate-50 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3 text-slate-700',
                        alignClass[col.align || 'left'],
                        col.className
                      )}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
