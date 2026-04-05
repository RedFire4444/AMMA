import { Bell, Plus, Send } from 'lucide-react';

export function NotificationsPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-text-primary">
            Notifications
          </h2>
          <p className="mt-1 text-text-secondary">
            Manage push notifications and announcements. Full implementation coming in Phase 2.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-secondary">
          <Plus size={16} />
          New Notification
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-surface p-6 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Send size={20} className="text-primary" />
          </div>
          <h3 className="font-semibold text-text-primary">Push Notifications</h3>
          <p className="mt-2 text-sm text-text-secondary">
            Send targeted push notifications to user segments.
          </p>
          <p className="mt-3 text-2xl font-bold text-text-primary">--</p>
          <p className="text-xs text-text-secondary">Sent this month</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-surface p-6 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <Bell size={20} className="text-accent" />
          </div>
          <h3 className="font-semibold text-text-primary">Scheduled</h3>
          <p className="mt-2 text-sm text-text-secondary">
            Notifications scheduled for future delivery.
          </p>
          <p className="mt-3 text-2xl font-bold text-text-primary">--</p>
          <p className="text-xs text-text-secondary">Pending</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-surface p-6 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
            <Bell size={20} className="text-secondary" />
          </div>
          <h3 className="font-semibold text-text-primary">In-App Messages</h3>
          <p className="mt-2 text-sm text-text-secondary">
            Manage in-app banners and announcements.
          </p>
          <p className="mt-3 text-2xl font-bold text-text-primary">--</p>
          <p className="text-xs text-text-secondary">Active</p>
        </div>
      </div>
    </div>
  );
}
