"use client";

interface Props {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

export default function LargeCard({ title, value, icon, className }: Props) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-200/60 transition-all hover:-translate-y-0.5 dark:border-white/10 dark:bg-slate-900/60 dark:shadow-black/20 ${className ?? ""}`}
    >
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {title}
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
            {value}
          </h2>
        </div>

        {icon && (
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
