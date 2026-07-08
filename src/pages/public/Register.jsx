import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Zap, CheckCircle } from 'lucide-react'

const PERKS = ['Free for up to 3 units', 'Tenant portal included', 'No credit card needed']

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    setError('')
    const { error } = await signUp(form)
    if (error) { setError(error); setLoading(false) }
    else setSuccess(true)
  }

  if (success) return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Check your email</h2>
        <p className="text-sm text-slate-500">We sent a confirmation link to <strong>{form.email}</strong>. Click it to activate your account.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-brand-500 items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Start for free</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your rentals in one place</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {PERKS.map(p => (
            <span key={p} className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-full px-3 py-1">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" /> {p}
            </span>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          <div>
            <label className="label">Full name</label>
            <input className="input" type="text" placeholder="John Smith" value={form.fullName}
              onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="Min. 8 characters" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create free account'}
          </button>
          <p className="text-xs text-center text-slate-400">
            By signing up you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>

        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
