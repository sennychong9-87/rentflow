import { useState, useEffect } from 'react'
import { FileText, Upload, Download, Trash2, Eye, Lock, Unlock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useTenantStore } from '@/store/tenantStore'
import { formatDate, cn } from '@/lib/utils'
import { DOCUMENT_CATEGORIES } from '@/lib/constants'
import EmptyState from '@/components/shared/EmptyState'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

const CATEGORY_COLORS = {
  lease: 'badge-blue', notice: 'badge-yellow', inspection: 'badge-green',
  photo: 'badge-slate', receipt: 'badge-slate', other: 'badge-slate',
}

function UploadModal({ onClose, onSave, tenants }) {
  const [file, setFile] = useState(null)
  const [form, setForm] = useState({ name: '', category: 'lease', tenant_id: '', visible_to_tenant: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (f) { setFile(f); if (!form.name) setForm(p => ({ ...p, name: f.name.replace(/\.[^.]+$/, '') })) }
  }

  const handleUpload = async () => {
    if (!file) { setError('Please select a file'); return }
    if (!form.name) { setError('Please enter a document name'); return }
    setLoading(true); setError('')
    await onSave(file, form)
    setLoading(false); onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-lg">Upload document</h2>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>}

          {/* File drop zone */}
          <label className={cn('flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors',
            file ? 'border-brand-300 bg-brand-50' : 'border-slate-200 hover:border-brand-300 hover:bg-brand-50')}>
            <Upload className={cn('w-8 h-8 mb-2', file ? 'text-brand-500' : 'text-slate-300')} />
            {file ? (
              <><p className="text-sm font-medium text-brand-700">{file.name}</p><p className="text-xs text-brand-500 mt-0.5">{(file.size / 1024).toFixed(0)} KB</p></>
            ) : (
              <><p className="text-sm text-slate-500">Click to select file</p><p className="text-xs text-slate-400 mt-0.5">PDF, images, Word docs</p></>
            )}
            <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp" />
          </label>

          <div>
            <label className="label">Document name</label>
            <input className="input" placeholder="e.g. Lease Agreement 2026" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {DOCUMENT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Link to tenant <span className="text-slate-400 font-normal">(optional)</span></label>
            <select className="input" value={form.tenant_id} onChange={e => setForm(f => ({ ...f, tenant_id: e.target.value }))}>
              <option value="">— No tenant —</option>
              {tenants.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setForm(f => ({ ...f, visible_to_tenant: !f.visible_to_tenant }))}
              className={cn('w-10 h-6 rounded-full transition-colors relative', form.visible_to_tenant ? 'bg-brand-500' : 'bg-slate-200')}>
              <div className={cn('w-4 h-4 bg-white rounded-full absolute top-1 transition-transform', form.visible_to_tenant ? 'translate-x-5' : 'translate-x-1')} />
            </div>
            <span className="text-sm text-slate-700">Visible to tenant in their portal</span>
          </label>
        </div>
        <div className="p-6 border-t border-slate-100 flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleUpload} disabled={loading} className="btn-primary gap-2">
            <Upload className="w-4 h-4" />{loading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Documents() {
  const { user } = useAuth()
  const { tenants, fetchTenants } = useTenantStore()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => { fetchTenants(); loadDocuments() }, [])

  const loadDocuments = async () => {
    setLoading(true)
    const { data } = await supabase.from('documents')
      .select('*, tenants(full_name)')
      .order('created_at', { ascending: false })
    setDocuments(data || [])
    setLoading(false)
  }

  const handleUpload = async (file, form) => {
    const ext = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage.from('documents').upload(path, file)
    if (uploadError) return

    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path)

    await supabase.from('documents').insert({
      landlord_id: user.id,
      tenant_id: form.tenant_id || null,
      name: form.name,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: path,
      public_url: urlData.publicUrl,
      category: form.category,
      visible_to_tenant: form.visible_to_tenant,
    })
    loadDocuments()
  }

  const handleDelete = async (doc) => {
    if (!confirm('Delete this document?')) return
    await supabase.storage.from('documents').remove([doc.storage_path])
    await supabase.from('documents').delete().eq('id', doc.id)
    setDocuments(prev => prev.filter(d => d.id !== doc.id))
  }

  const toggleVisibility = async (doc) => {
    await supabase.from('documents').update({ visible_to_tenant: !doc.visible_to_tenant }).eq('id', doc.id)
    setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, visible_to_tenant: !d.visible_to_tenant } : d))
  }

  const filtered = documents.filter(d => categoryFilter === 'all' || d.category === categoryFilter)

  if (loading) return <LoadingSpinner className="py-20" />

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Documents</h2>
          <p className="text-sm text-slate-500">{documents.length} file{documents.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary gap-2">
          <Upload className="w-4 h-4" /> Upload
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', ...DOCUMENT_CATEGORIES.map(c => c.value)].map(cat => (
          <button key={cat} onClick={() => setCategoryFilter(cat)}
            className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize',
              categoryFilter === cat ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
            {cat === 'all' ? 'All' : DOCUMENT_CATEGORIES.find(c => c.value === cat)?.label || cat}
          </button>
        ))}
      </div>

      {documents.length === 0 ? (
        <EmptyState icon={FileText} title="No documents yet"
          description="Upload leases, inspection reports, notices and any other files related to your properties."
          action={<button onClick={() => setShowModal(true)} className="btn-primary gap-2"><Upload className="w-4 h-4" />Upload first document</button>} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No documents in this category.</div>
      ) : (
        <div className="card overflow-hidden divide-y divide-slate-50">
          {filtered.map(doc => (
            <div key={doc.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-800 truncate">{doc.name}</p>
                  <span className={`badge ${CATEGORY_COLORS[doc.category] || 'badge-slate'} flex-shrink-0`}>
                    {DOCUMENT_CATEGORIES.find(c => c.value === doc.category)?.label || doc.category}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="text-xs text-slate-400">{formatDate(doc.created_at)}</p>
                  {doc.tenants && <p className="text-xs text-slate-400">· {doc.tenants.full_name}</p>}
                  {doc.file_size && <p className="text-xs text-slate-400">· {(doc.file_size / 1024).toFixed(0)} KB</p>}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => toggleVisibility(doc)} title={doc.visible_to_tenant ? 'Visible to tenant' : 'Hidden from tenant'}
                  className={cn('btn-ghost p-2', doc.visible_to_tenant ? 'text-green-500' : 'text-slate-300')}>
                  {doc.visible_to_tenant ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
                {doc.public_url && (
                  <a href={doc.public_url} target="_blank" rel="noreferrer" className="btn-ghost p-2">
                    <Download className="w-4 h-4" />
                  </a>
                )}
                <button onClick={() => handleDelete(doc)} className="btn-ghost p-2 text-slate-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <UploadModal onClose={() => setShowModal(false)} onSave={handleUpload} tenants={tenants} />}
    </div>
  )
}
