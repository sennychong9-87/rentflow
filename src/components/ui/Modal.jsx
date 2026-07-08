import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Modal component
 *
 * Usage:
 *   <Modal open={showModal} onClose={() => setShowModal(false)} title="Add tenant">
 *     <p>Modal content here</p>
 *     <Modal.Footer>
 *       <button onClick={onClose}>Cancel</button>
 *       <button>Save</button>
 *     </Modal.Footer>
 *   </Modal>
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',     // sm | md | lg | xl
  children,
  className,
}) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={cn(
        'relative bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] flex flex-col',
        sizes[size],
        className
      )}>
        {/* Header */}
        {(title || onClose) && (
          <div className="flex items-start justify-between p-6 border-b border-slate-100 flex-shrink-0">
            <div>
              {title && <h2 className="text-lg font-bold text-slate-900">{title}</h2>}
              {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="ml-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}

// Footer subcomponent
Modal.Footer = function ModalFooter({ children, className }) {
  return (
    <div className={cn(
      'flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0',
      className
    )}>
      {children}
    </div>
  )
}

// Body subcomponent
Modal.Body = function ModalBody({ children, className }) {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  )
}
