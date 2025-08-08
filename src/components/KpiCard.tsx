import { ReactNode } from 'react';
export default function KpiCard({ label, value, help, icon }: { label: string; value: string; help?: string; icon?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4" role="group" aria-label={label}>
      <div className="flex items-center gap-3">
        {icon && <div aria-hidden>{icon}</div>}
        <div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">{label}</div>
          <div className="text-2xl font-semibold" aria-live="polite">{value}</div>
          {help && <div className="text-xs text-neutral-500 mt-1">{help}</div>}
        </div>
      </div>
    </div>
  );
}
