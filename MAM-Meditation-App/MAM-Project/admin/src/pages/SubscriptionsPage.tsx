import { CreditCard, TrendingUp, Users, DollarSign } from 'lucide-react';

export function SubscriptionsPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="font-heading text-2xl font-bold text-text-primary">
          Subscriptions
        </h2>
        <p className="mt-1 text-text-secondary">
          Manage subscription plans and billing. Full implementation coming in Phase 2.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Active Subscribers', value: '--', icon: <Users size={20} />, color: 'primary' },
          { title: 'Monthly Revenue', value: '--', icon: <DollarSign size={20} />, color: 'accent' },
          { title: 'Growth Rate', value: '--', icon: <TrendingUp size={20} />, color: 'secondary' },
          { title: 'Plan Types', value: '--', icon: <CreditCard size={20} />, color: 'primary' },
        ].map((stat) => (
          <div key={stat.title} className="rounded-xl border border-gray-100 bg-surface p-6 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <span className="text-primary">{stat.icon}</span>
            </div>
            <p className="text-sm text-text-secondary">{stat.title}</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-100 bg-surface p-8 shadow-sm">
        <h3 className="font-heading text-lg font-semibold text-text-primary">
          Subscription Plans
        </h3>
        <p className="mt-2 text-text-secondary">
          Subscription plan management, pricing tiers, and billing analytics will be
          available after payment gateway integration in Phase 2.
        </p>
      </div>
    </div>
  );
}
