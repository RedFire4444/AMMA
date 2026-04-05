import { Calendar, Plus, MapPin, Clock } from 'lucide-react';

export function EventsPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-text-primary">
            Event Management
          </h2>
          <p className="mt-1 text-text-secondary">
            Manage meditation events and workshops. Full implementation coming in Phase 2.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-secondary">
          <Plus size={16} />
          Create Event
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[
          { title: 'Morning Meditation Circle', date: 'TBD', location: 'Virtual' },
          { title: 'Weekend Mindfulness Retreat', date: 'TBD', location: 'In Person' },
        ].map((event) => (
          <div key={event.title} className="rounded-xl border border-gray-100 bg-surface p-6 shadow-sm">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar size={20} className="text-primary" />
              </div>
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                Placeholder
              </span>
            </div>
            <h3 className="font-heading text-lg font-semibold text-text-primary">{event.title}</h3>
            <div className="mt-3 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Clock size={14} />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <MapPin size={14} />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
