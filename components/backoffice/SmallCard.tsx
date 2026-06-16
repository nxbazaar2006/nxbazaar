interface Props {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
  tone?: "sky" | "amber" | "violet" | "emerald";
}

const toneClasses = {
  sky: {
    dot: "bg-sky-500",
    icon: "bg-sky-50 text-foreground ring-sky-500/10 dark:bg-sky-400/10 dark:text-foreground dark:ring-sky-300/10",
  },
  amber: {
    dot: "bg-amber-500",
    icon: "bg-amber-50 text-amber-600 ring-amber-500/10 dark:bg-amber-400/10 dark:text-foreground dark:ring-amber-300/10",
  },
  violet: {
    dot: "bg-violet-500",
    icon: "bg-violet-50 text-violet-600 ring-violet-500/10 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-300/10",
  },
  emerald: {
    dot: "bg-emerald-500",
    icon: "bg-emerald-50 text-emerald-600 ring-emerald-500/10 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-300/10",
  },
};

export default function SmallCard({
  title,
  value,
  icon,
  className,
  tone = "sky",
}: Props) {
  const toneClass = toneClasses[tone];

  return (
    <div
      className={`dashboard-stat-card group flex min-h-14 min-w-0 items-center gap-3 rounded-2xl px-3 py-2 ${className ?? ""}`}
    >
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${toneClass.dot} shadow-sm ring-4 ring-slate-950/5 dark:ring-white/10`} />

      <div
        className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl ring-1 transition-transform duration-300 group-hover:scale-105 ${toneClass.icon}`}
      >
        {icon}
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <p className="text-foreground truncate text-[11px] font-medium uppercase">{title}</p>
        <h3 className="text-foreground shrink-0 text-base font-semibold tracking-tight">
          {value}
        </h3>
      </div>
    </div>
  );
}
