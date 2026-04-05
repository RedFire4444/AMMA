import { BookOpen, Plus } from 'lucide-react';

export function CoursesPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-text-primary">
            Course Management
          </h2>
          <p className="mt-1 text-text-secondary">
            Manage meditation courses. Full implementation coming in Phase 2.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-secondary">
          <Plus size={16} />
          Add Course
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {['Beginner Mindfulness', 'Stress Relief', 'Deep Meditation'].map((course) => (
          <div key={course} className="rounded-xl border border-gray-100 bg-surface p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen size={24} className="text-primary" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-text-primary">{course}</h3>
            <p className="mt-2 text-sm text-text-secondary">
              Course details will be loaded from the database.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                Placeholder
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
