import { Quote, Plus, RefreshCw } from 'lucide-react';

export function QuotesPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-text-primary">
            Daily Quotes
          </h2>
          <p className="mt-1 text-text-secondary">
            Manage inspirational quotes. Full implementation coming in Phase 2.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-gray-50">
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-secondary">
            <Plus size={16} />
            Add Quote
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {[
          { text: 'The mind is everything. What you think you become.', author: 'Buddha' },
          { text: 'Peace comes from within. Do not seek it without.', author: 'Buddha' },
          { text: 'In the midst of movement and chaos, keep stillness inside of you.', author: 'Deepak Chopra' },
        ].map((quote, index) => (
          <div key={index} className="rounded-xl border border-gray-100 bg-surface p-6 shadow-sm">
            <Quote size={24} className="mb-3 text-primary/30" />
            <p className="font-heading text-lg italic text-text-primary">
              &ldquo;{quote.text}&rdquo;
            </p>
            <p className="mt-3 text-sm font-medium text-accent">
              &mdash; {quote.author}
            </p>
            <div className="mt-4">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Sample Quote
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
