interface Props {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

export default function SmallCard({ title, value, icon, className }: Props) {
  return (
    <div
      className={`flex items-center gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm shadow-slate-200/60 transition dark:border-white/10 dark:bg-slate-900/60 dark:shadow-black/20 ${className ?? ""}`}
    >

      <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-700 dark:text-cyan-200">
        {icon}
      </div>

      <div>
        <p className="text-xs text-slate-600 dark:text-slate-400">{title}</p>
        <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
          {value}
        </h3>
      </div>
    </div>
  );
}
