import { Link } from 'react-router-dom'
import { Building2, Users, DollarSign, Wrench, ArrowRight, CheckCircle } from 'lucide-react'

const FEATURES = [
  { icon: Building2, title: 'Property & Unit Management', desc: 'Add all your properties and units in minutes. Track occupancy at a glance.' },
  { icon: Users, title: 'Tenant Portal', desc: 'Every tenant gets a private portal link — no app download, no password.' },
  { icon: DollarSign, title: 'Rent Ledger', desc: 'Track who has paid, who is late, and how much is outstanding each month.' },
  { icon: Wrench, title: 'Maintenance Tickets', desc: 'Tenants submit issues, you track and resolve them — all in one place.' },
]

const PRICING = [
  { name: 'Free', price: 0, units: 3, features: ['3 units', 'Tenant portal', 'Maintenance tickets', '5 document uploads'] },
  { name: 'Pro', price: 29, units: 20, features: ['20 units', 'Rent ledger', 'Messaging', 'Lease tracking', '100 documents'], popular: true },
  { name: 'Growth', price: 49, units: '∞', features: ['Unlimited units', 'Everything in Pro', 'Unlimited documents', 'Priority support'] },
]

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
          Built for landlords with 1–20 units
        </div>
        <h1 className="text-5xl font-bold text-slate-900 mb-5 leading-tight">
          Property management<br />without the complexity
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-xl mx-auto">
          RentFlow helps independent landlords manage tenants, collect rent, and handle maintenance — all from one simple dashboard.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/register" className="btn-primary px-6 py-3 text-base gap-2">
            Start for free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login" className="btn-secondary px-6 py-3 text-base">Sign in</Link>
        </div>
        <p className="text-xs text-slate-400 mt-4">Free forever for up to 3 units · No credit card required</p>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Everything you need, nothing you don't</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-3">Simple, honest pricing</h2>
          <p className="text-slate-500 text-center mb-12">Start free. Upgrade when you're ready.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING.map(({ name, price, units, features, popular }) => (
              <div key={name} className={`card p-6 relative ${popular ? 'ring-2 ring-brand-500' : ''}`}>
                {popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most popular
                  </span>
                )}
                <p className="font-semibold text-slate-900 mb-1">{name}</p>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-4xl font-bold text-slate-900">${price}</span>
                  <span className="text-slate-400 text-sm mb-1">/month</span>
                </div>
                <p className="text-sm text-slate-500 mb-4">Up to {units} units</p>
                <ul className="space-y-2 mb-6">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={popular ? 'btn-primary w-full' : 'btn-secondary w-full'}>
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} RentFlow · Built for independent landlords
        </div>
      </footer>
    </div>
  )
}
