import { AlertTriangle } from 'lucide-react'

/**
 * ConfirmDialog — replaces ugly window.confirm()
 *
 * Usage:
 *   const [confirm, setConfirm] = useState(null)
 *
 *   // Trigger it:
 *   setConfirm({
 *     title: 'Delete tenant',
 *     message: 'This will remove Jane Smith and all their data. This cannot be undone.',
 *     confirmLabel: 'Delete',
 *     danger: true,
 *     onConfirm: () => deleteTenant(id),
 *   })
 *
 *   // Render it:
 *   {confirm && <ConfirmDialog {...confirm} onClose={() => setConfirm(null)} />}
 */
export default function ConfirmDialog({
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onClose,
}) {
  const handleConfirm = () => {
    onConfirm?.()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">

        {/* Icon + Title */}
        <div className="p-6 flex flex-col items-center text-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
            danger ? 'bg-red-100' : 'bg-yellow-100'
          }`}>
            <AlertTriangle className={`w-6 h-6 ${danger ? 'text-red-500' : 'text-yellow-500'}`} />
          </div>

          <h2 className="text-lg font-bold text-slate-900 mb-2">{title}</h2>

          {message && (
            <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 btn ${
              danger
                ? 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500'
                : 'bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-500'
            } px-4 py-2 text-sm`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
