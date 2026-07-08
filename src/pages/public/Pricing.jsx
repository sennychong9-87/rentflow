import { Link } from 'react-router-dom'
import { CheckCircle, X, Zap, ArrowRight } from 'lucide-react'
import { PLANS } from '@/lib/constants'

const FEATURE_MATRIX = [
  { label: 'Properties', free: 'Up to 1', pro: 'Up to 10', growth: 'Unlimited' },
  { label: 'Units', free: 'Up to 3', pro: 'Up to 20', growth: 'Unlimited' },
  { label: 'Tenant portal (no login)', free: true, pro: true, growth: true },
  { label: 'Maintenance tickets', free: true, pro: true, growth: true },
  { label: 'Tenant messaging', free: false, pro: true, growth: true },
  { label: 'Rent ledger', free: false, pro: true, growth: true },
  { label: 'Lease tracking', free: false, pro: true, growth: true },
  { label: 'Document uploads', free: '5 docs', pro: '100 docs', growth: 'Unlimited' },
  { label: 'Supabase Storage', free: false, pro: true, growth: true },
  { label: 'Analytics & reports', free: false, pro: false, growth: true },
  { label: 'Priority support', free: false, pro: false, growth: true },
  { label: 'Custom portal branding', free: false, pro: false, growth: true },
]

const FAQS = [
  {
    q: 'Is the free plan really free forever?',
    a: 'Yes. No credit card, no trial period, no hidden fees. Free means free for up to 3 units.',
  },
  {
    q: 'Can I upgrade or downgrade anytime?',
    a: 'Yes. You can upgrade, downgrade, or cancel at any time from your Settings page. No lock-in contracts.',
  },
  {
    q: 'How does the tenant portal work?',
    a: 'Every tenant gets a unique private link. They click it — no app download, no account creation needed. They can submit maintenance requests, check rent status, message you, and view shared documents.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit and debit cards via Lemon Squeezy. Payments are processed securely — we never store your card details.',
  },
  {
    q: 'What happens if I exceed my plan limits?',
    a: "You'll be notified and prompted to upgrade. We won't delete your data or lock you out — you just won't be able to add new units until you upgrade.",
  },
  {
    q: 'Do you offer refunds?',
    a: 'Yes. If you are unsatisfied within the first 14 days of a paid plan, contact us for a full refund. No questions asked.',
  },
]

function Check() {
  return <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
}
function Cross() {
  return <X className="w-5 h-5 text-slate-200 mx-auto" />
}
function Cell({ value }) {
  if (value === true) return <Check />
  if (value === false) return <Cross />
  return <span className="text-sm text-slate-600 font-medium">{value}</span>
}

export default function Pricing() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-16 pb-12 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Simple, honest pricing
        </h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto">
          Start free. Upgrade when your portfolio grows. Cancel anytime — no lock-in, no surprises.
        </p>
      </section>

      {/* Pricing cards */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              key: 'free',
              name: 'Free',
              price: 0,
              description: 'Perfect for landlords just getting started',
              cta: 'Get started free',
              ctaTo: '/register',
              popular: false,
            },
            {
              key: 'pro',
              name: 'Pro',
              price: 29,
              description: 'Everything you need to manage rentals professionally',
              cta: 'Start Pro',
              ctaTo: '/register',
              popular: true,
            },
            {
              key: 'growth',
              name: 'Growth',
              price: 49,
              description: 'Unlimited scale for serious landlords',
              cta: 'Start Growth',
              ctaTo: '/register',
              popular: false,
            },
          ].map(({ key, name, price, description, cta, ctaTo, popular }) => {
            const plan = PLANS[key]
            return (
              <div key={key} className={`card p-6 relative flex flex-col ${popular ? 'ring-2 ring-brand-500 shadow-lg' : ''}`}>
                {popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-brand-500 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5">
                      <Zap className="w-3 h-3" /> Most popular
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <p className="font-bold text-slate-900 text-lg">{name}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{description}</p>
                </div>

                <div className="flex items-end gap-1 mb-6">
                  <span className="text-5xl font-bold text-slate-900">${price}</span>
                  <span className="text-slate-400 mb-1.5">/month</span>
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to={ctaTo}
                  className={`w-full text-center py-2.5 px-4 rounded-lg font-medium text-sm transition-all gap-2 flex items-center justify-center ${
                    popular
                      ? 'bg-brand-500 text-white hover:bg-brand-600'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )
          })}
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          All plans include HTTPS, Supabase-powered security, and automatic backups.
        </p>
      </section>

      {/* Feature comparison table */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Full feature comparison</h2>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-4 text-slate-500 font-semibold w-1/2">Feature</th>
                  <th className="text-center px-4 py-4 text-slate-700 font-bold">Free</th>
                  <th className="text-center px-4 py-4 text-brand-600 font-bold">Pro</th>
                  <th className="text-center px-4 py-4 text-slate-700 font-bold">Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {FEATURE_MATRIX.map(({ label, free, pro, growth }) => (
                  <tr key={label} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 text-slate-700">{label}</td>
                    <td className="px-4 py-3.5 text-center"><Cell value={free} /></td>
                    <td className="px-4 py-3.5 text-center bg-brand-50/30"><Cell value={pro} /></td>
                    <td className="px-4 py-3.5 text-center"><Cell value={growth} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Frequently asked questions</h2>
        <div className="space-y-4">
          {FAQS.map(({ q, a }) => (
            <div key={q} className="card p-5">
              <p className="font-semibold text-slate-900 mb-2">{q}</p>
              <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-brand-500 py-16 px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Ready to simplify your rentals?</h2>
        <p className="text-brand-100 mb-8 text-lg">Start free today. No credit card required.</p>
        <Link to="/register" className="inline-flex items-center gap-2 bg-white text-brand-600 font-bold px-8 py-3.5 rounded-xl hover:bg-brand-50 transition-colors text-base">
          Get started free <ArrowRight className="w-5 h-5" />
        </Link>
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
