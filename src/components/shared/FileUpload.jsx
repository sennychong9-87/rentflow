import { useState, useRef } from 'react'
import { Upload, X, FileText, Image, File } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

/**
 * FileUpload — Reusable Supabase Storage upload wrapper
 *
 * Usage:
 *   <FileUpload
 *     bucket="documents"
 *     path={`${userId}/leases`}
 *     accept=".pdf,.doc,.docx"
 *     maxSizeMB={10}
 *     onUploadComplete={(url, path, file) => console.log(url)}
 *     onError={(msg) => console.error(msg)}
 *   />
 */
export default function FileUpload({
  bucket = 'documents',
  path = '',
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.webp',
  maxSizeMB = 10,
  multiple = false,
  onUploadComplete,
  onError,
  label = 'Click to upload or drag and drop',
  sublabel,
  className,
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [progress, setProgress] = useState(0)
  const inputRef = useRef(null)

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return Image
    if (type?.includes('pdf') || type?.includes('doc')) return FileText
    return File
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const uploadFile = async (file) => {
    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      onError?.(`File too large. Maximum size is ${maxSizeMB}MB.`)
      return
    }

    setUploading(true)
    setProgress(10)

    try {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const fullPath = path ? `${path}/${fileName}` : fileName

      setProgress(40)

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fullPath, file, { upsert: false })

      if (error) throw error

      setProgress(80)

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fullPath)

      setProgress(100)

      const result = {
        url: urlData.publicUrl,
        path: fullPath,
        name: file.name,
        size: file.size,
        type: file.type,
      }

      setUploadedFiles(prev => [...prev, result])
      onUploadComplete?.(result.url, result.path, file)

    } catch (err) {
      onError?.(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleFiles = (files) => {
    const fileArray = Array.from(files)
    if (!multiple && fileArray.length > 1) {
      onError?.('Only one file can be uploaded at a time.')
      return
    }
    fileArray.forEach(uploadFile)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)
  const handleInputChange = (e) => handleFiles(e.target.files)

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-150 text-center',
          isDragging
            ? 'border-brand-400 bg-brand-50 scale-[1.01]'
            : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50',
          uploading && 'pointer-events-none opacity-60'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
        />

        {uploading ? (
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-brand-500 animate-spin mx-auto" />
            <p className="text-sm text-slate-500">Uploading…</p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 max-w-xs mx-auto">
              <div
                className="bg-brand-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors',
              isDragging ? 'bg-brand-100' : 'bg-slate-100'
            )}>
              <Upload className={cn('w-6 h-6 transition-colors', isDragging ? 'text-brand-500' : 'text-slate-400')} />
            </div>
            <p className="text-sm font-medium text-slate-700">{label}</p>
            <p className="text-xs text-slate-400 mt-1">
              {sublabel || `${accept.replace(/\./g, '').replace(/,/g, ', ').toUpperCase()} · Max ${maxSizeMB}MB`}
            </p>
          </>
        )}
      </div>

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((f, i) => {
            const Icon = getFileIcon(f.type)
            return (
              <div key={i} className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{f.name}</p>
                  <p className="text-xs text-slate-400">{formatSize(f.size)} · Uploaded</p>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  className="flex-shrink-0 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
