import { useState, useEffect } from 'react'
import { subscriptionsAPI, paymentsAPI } from '../../services/api'
import { toast } from 'react-toastify'
import { CreditCard, Check, Zap, Crown, Building2 } from 'lucide-react'
import { load } from '@cashfreepayments/cashfree-js'
console.log(load)

const PLAN_ICONS: Record<string, any> = { FREE: Zap, PREMIUM: Crown, ENTERPRISE: Building2 }
const PLAN_COLORS: Record<string, string> = {
  FREE: 'border-gray-200',
  PREMIUM: 'border-primary-500 ring-2 ring-primary-500',
  ENTERPRISE: 'border-purple-500 ring-2 ring-purple-500',
}
const PLAN_BADGE: Record<string, string> = {
  FREE: 'bg-gray-100 text-gray-700',
  PREMIUM: 'bg-primary-100 text-primary-700',
  ENTERPRISE: 'bg-purple-100 text-purple-700',
}

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [current, setCurrent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<number | null>(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [plansRes, subRes] = await Promise.allSettled([
        subscriptionsAPI.listPlans(),
        subscriptionsAPI.mySubscription(),
      ])
      if (plansRes.status === 'fulfilled') setPlans(plansRes.value.data)
      if (subRes.status === 'fulfilled') setCurrent(subRes.value.data)
    } finally { setLoading(false) }
  }

  const handleSubscribe = async (planId: number) => {

    try {

      const { data } =
        await paymentsAPI.createOrder(planId)

      const cashfree = await load({
        mode: "sandbox"
      })

      cashfree.checkout({
        paymentSessionId:
          data.payment_session_id,
        redirectTarget: "_self"
      })

    } catch (err: any) {

      toast.error(
        err?.response?.data?.detail ||
        'Payment failed'
      )
    }
  }

  const handleCancel = async () => {
    if (!confirm('Cancel your subscription?')) return
    try {
      await subscriptionsAPI.cancel()
      toast.success('Subscription cancelled')
      setCurrent(null)
      loadData()
    } catch { toast.error('Failed to cancel') }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
        <p className="text-gray-500 mt-1">Choose the plan that fits your needs</p>
      </div>

      {/* Current subscription banner */}
      {current && (
        <div className="card border-l-4 border-l-green-500 bg-green-50 border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-900">Active Subscription</p>
              <p className="text-sm text-green-700 mt-0.5">
                Plan ID: {current.plan_id} · Expires: {current.expires_at ? new Date(current.expires_at).toLocaleDateString() : 'Never'}
              </p>
            </div>
            <button onClick={handleCancel} className="text-sm text-red-500 hover:text-red-700 font-medium">
              Cancel Plan
            </button>
          </div>
        </div>
      )}

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan: any) => {
          const Icon = PLAN_ICONS[plan.type] || Zap
          const isCurrentPlan = current?.plan_id === plan.id
          const features: string[] = []
          if (plan.job_posting_limit) features.push(`${plan.job_posting_limit === 9999 ? 'Unlimited' : plan.job_posting_limit} job postings`)
          if (plan.featured_jobs > 0) features.push(`${plan.featured_jobs} featured job slots`)
          if (plan.resume_access) features.push('Resume database access')
          if (plan.analytics_access) features.push('Advanced analytics')
          if (plan.priority_support) features.push('Priority support')

          return (
            <div key={plan.id} className={`card flex flex-col border-2 transition-all ${PLAN_COLORS[plan.type]}`}>
              {plan.type === 'PREMIUM' && (
                <div className="text-center mb-3">
                  <span className="badge bg-primary-600 text-white px-3 py-1">Most Popular</span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${PLAN_BADGE[plan.type]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{plan.name}</h3>
                  <span className={`badge ${PLAN_BADGE[plan.type]} text-xs`}>{plan.type}</span>
                </div>
              </div>

              <div className="mb-5">
                <span className="text-3xl font-extrabold text-gray-900">
                  {plan.price === 0 ? 'Free' : `$${plan.price}`}
                </span>
                {plan.price > 0 && <span className="text-gray-400 text-sm">/{plan.billing_cycle?.toLowerCase()}</span>}
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {features.map((f: string) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => !isCurrentPlan && handleSubscribe(plan.id)}
                disabled={isCurrentPlan || subscribing === plan.id}
                className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${isCurrentPlan
                  ? 'bg-green-100 text-green-700 cursor-default'
                  : plan.type === 'PREMIUM'
                    ? 'bg-primary-600 hover:bg-primary-700 text-white'
                    : plan.type === 'ENTERPRISE'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
              >
                {isCurrentPlan ? '✓ Current Plan' : subscribing === plan.id ? 'Processing...' : `Get ${plan.name}`}
              </button>
            </div>
          )
        })}
      </div>

      {plans.length === 0 && (
        <div className="card text-center py-12">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No plans available yet</p>
        </div>
      )}
    </div>
  )
}


