import { useState, useEffect, useCallback } from 'react'
import {
  Activity, Users, Building2, DollarSign, Wrench,
  FileText, ExternalLink, MessageSquare, ChevronDown
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { formatRelative, formatDate, cn } from '@/lib/utils'
import EmptyState from '@/components/shared/EmptyState'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { fetchAuditLogs } from '@/hooks/useAuditLog'

const ENTITY_ICONS = {
  tenant: Users,
  property: Building2,
  unit: Building2,
  lease: FileText,
  rent: DollarSign,
  maintenance: Wrench,
  document: FileText,
  message: MessageSquare,
  portal: ExternalLink,
}

const ACTION_COLORS = {
  created: 'bg-green-500',
  updated: 'bg-blue-500',
  deleted: 'bg-red-500',
  paid: 'bg-green-500',
  resolved: 'bg-green-500',
  accessed: 'bg-slate-400',
  uploaded: 'bg-yellow-500',
  sent: 'bg-brand-500',
}

const ACTIONS = ['created', 'updated', 'deleted', 'paid', 'resolved', 'accessed', 'uploaded', 'sent']

function ActionDot({ action }) {
  const color = ACTION_COLORS[action] || 'bg-slate-400'
  return <span className={cn('w-2 h-2 rounded-full flex-shrink-0', color)} />
}

export default function ActivityLog() {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)

  const [entityFilter, setEntityFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [search, setSearch] = useState('')

  const buildFilters = useCallback((pageNum = 1, append = false) => {
    const filters = { landlord_id: user.id, page: pageNum, limit: 50, append }

    if (entityFilter) filters.entity_type = entityFilter

    if (dateFilter) {
      const now = new Date()
      if (dateFilter === 'today') {
        filters.from = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      } else if (dateFilter === '7days') {
        const d = new Date(now); d.setDate(d.getDate() - 7)
        filters.from = d.toISOString()
      } else if (dateFilter === '30days') {
        const d = new Date(now); d.setDate(d.getDate() - 30)
        filters.from = d.toISOString()
      }
    }

    if (search.trim()) filters.search = search.trim()

    return filters
  }, [user.id, entityFilter, dateFilter, search])

  const loadLogs = useCallback(async (pageNum = 1) => {
    if (pageNum === 1) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    const filters = buildFilters(pageNum)
    const { data, count } = await fetchAuditLogs(filters)

    if (pageNum === 1) {
      setLogs(data)
    } else {
      setLogs(prev => [...prev, ...data])
    }
    setTotalCount(count || 0)
    setPage(pageNum)
    setLoading(false)
    setLoadingMore(false)
  }, [buildFilters])

  useEffect(() => {
    if (user) {
      setLogs([])
      setPage(1)
      loadLogs(1)
    }
  }, [user, entityFilter, dateFilter, search])

  const loadMore = () => loadLogs(page + 1)

  if (loading) return <LoadingSpinner className="py-20" />

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Activity Log</h2>
        <p className="text-sm text-slate-500">Complete history of changes across all your properties</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          className="input w-auto min-w-[140px]"
          value={entityFilter}
          onChange={e => { setEntityFilter(e.target.value); setPage(1) }}
        >
          <option value="">All entity types</option>
          {[
            { value: 'tenant', label: 'Tenant' },
            { value: 'property', label: 'Property' },
            { value: 'unit', label: 'Unit' },
            { value: 'lease', label: 'Lease' },
            { value: 'rent', label: 'Rent' },
            { value: 'maintenance', label: 'Maintenance' },
            { value: 'document', label: 'Document' },
            { value: 'message', label: 'Message' },
            { value: 'portal', label: 'Portal' },
          ].map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <select
          className="input w-auto min-w-[140px]"
          value={dateFilter}
          onChange={e => { setDateFilter(e.target.value); setPage(1) }}
        >
          <option value="">All time</option>
          <option value="today">Today</option>
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
        </select>

        <input
          className="input w-auto min-w-[200px]"
          placeholder="Search descriptions…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
        />
      </div>

      {/* List */}
      {logs.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No activity yet"
          description="Activity will appear here as you manage your properties"
        />
      ) : (
        <div className="card overflow-hidden divide-y divide-slate-50">
          {logs.map(log => {
            const Icon = ENTITY_ICONS[log.entity_type] || Activity
            return (
              <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <ActionDot action={log.action} />
                    <p className="text-sm text-slate-800">{log.description}</p>
                  </div>
                  {log.entity_label && (
                    <p className="text-xs text-slate-400 mt-0.5 ml-4">{log.entity_label}</p>
                  )}
                </div>
                <div
                  className="text-xs text-slate-400 flex-shrink-0 mt-1"
                  title={formatDate(log.created_at, 'MMM d, yyyy h:mm a')}
                >
                  {formatRelative(log.created_at)}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="text-center">
          <p className="text-sm text-slate-400 mb-3">
            Showing {logs.length} of {totalCount} events
          </p>
          {logs.length < totalCount && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="btn-secondary gap-2"
            >
              <ChevronDown className="w-4 h-4" />
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
