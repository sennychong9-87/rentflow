import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const ToastContext = createContext(null)

const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertCircle,
  info:    Info,
}

const STYLES = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error:   'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info:    'bg-blue-50 border-blue-200 text-blue-800',
}

const ICON_STYLES = {
  success: 'text-green-500',
  error:   'text-red-500',
  warning: 'text-yellow-500',
  info:    'text-blue-500',
}

function ToastItem({ id, type = 'info', message, onRemove }) {
  const Icon = ICONS[type]

  useEffect(() => {
    const timer = setTimeout(() => onRemove(id), 4000)
    return () => clearTimeout(timer)
  }, [id, onRemove])

  return (
    <div className={cn(
      'flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm w-full',
      STYLES[type]
    )}>
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', ICON_STYLES[type])} />
      <p className="text-sm font-medium flex-1 leading-snug">{message}</p>
      <button onClick={() => onRemove(id)} className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info:    (msg) => addToast(msg, 'info'),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem {...t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
