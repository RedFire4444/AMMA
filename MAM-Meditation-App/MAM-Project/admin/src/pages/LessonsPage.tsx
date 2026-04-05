import { FileText, Plus, Search } from 'lucide-react';

export function LessonsPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-text-primary">
            Lesson Management
          </h2>
          <p className="mt-1 text-text-secondary">
            Manage lessons and guided meditations. Full implementation coming in Phase 2.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-secondary">
          <Plus size={16} />
          Add Lesson
        </button>
      </div>

      <div className="rounded-xl border border-gray-100 bg-surface shadow-sm">
        <div className="flex items-center gap-4 border-b border-gray-100 px-6 py-4">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
            <Search size={16} className="text-text-secondary" />
            <input
              type="text"
              placeholder="Search lessons..."
              disabled
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
            />
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <FileText size={32} className="text-primary" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-text-primary">
              No lessons yet
            </h3>
            <p className="mt-2 max-w-sm text-center text-sm text-text-secondary">
              Lesson content will be managed here once the backend integration is completed.
              You will be able to create, edit, and organize guided meditation sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
