import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { User, Bell, CreditCard, Shield, CheckCircle } from 'lucide-react'
import { PLANS } from '@/lib/constants'

function Section({ title, description, children }) {
  return (
    <div className="card p-6 space-y-5">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

export default function Settings() {
  const { profile, updateProfile, signOut } = useAuth()
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    business_name: profile?.business_name || '',
    phone: profile?.phone || '',
  })
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await updateProfile(form)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const currentPlan = PLANS[profile?.plan || 'free']

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Section title="Profile" description="Your personal and business information">
        <div className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Business name <span className="text-slate-400 font-normal">(optional)</span></label>
            <input className="input" placeholder="Smith Properties LLC" value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Phone <span className="text-slate-400 font-normal">(optional)</span></label>
            <input className="input" placeholder="+1 555 000 0000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input bg-slate-50" value={profile?.email || ''} disabled />
            <p className="text-xs text-slate-400 mt-1">Email cannot be changed here.</p>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary gap-2">
            {saved ? <><CheckCircle className="w-4 h-4" />Saved!</> : saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </Section>

      {/* Plan */}
      <Section title="Plan & billing" description="Your current plan and usage">
        <div className="bg-slate-50 rounded-xl p-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-slate-900">{currentPlan.name}</span>
              <span className="badge-blue badge">Current plan</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-3">${currentPlan.price}<span className="text-sm font-normal text-slate-400">/month</span></p>
            <ul className="space-y-1.5">
              {currentPlan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />{f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {profile?.plan !== 'growth' && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Upgrade your plan</p>
            {Object.entries(PLANS).filter(([key]) => key !== profile?.plan && key !== 'free').map(([key, plan]) => (
              <div key={key} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-brand-300 transition-colors">
                <div>
                  <p className="font-medium text-slate-900">{plan.name} — ${plan.price}/month</p>
                  <p className="text-xs text-slate-400 mt-0.5">{plan.features[0]}</p>
                </div>
                <button className="btn-primary text-xs px-3 py-2">Upgrade</button>
              </div>
            ))}
            <p className="text-xs text-slate-400">Payment via Lemon Squeezy. Cancel anytime.</p>
          </div>
        )}
      </Section>

      {/* Danger zone */}
      <Section title="Account" description="Sign out or manage your account">
        <div className="flex flex-col gap-3">
          <button onClick={signOut} className="btn-secondary w-full justify-start gap-2 text-slate-600">
            <Shield className="w-4 h-4" /> Sign out
          </button>
          <button className="btn-secondary w-full justify-start gap-2 text-red-500 hover:bg-red-50 hover:border-red-200">
            <Shield className="w-4 h-4" /> Delete account
          </button>
        </div>
      </Section>
    </div>
  )
}
