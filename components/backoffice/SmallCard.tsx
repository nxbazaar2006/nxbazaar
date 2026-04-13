interface Props {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

export default function SmallCard({ title, value, icon }: Props) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl
      bg-white/60 dark:bg-slate-800/60
      backdrop-blur-xl border border-slate-200 dark:border-slate-700
      hover:shadow-md transition">

      <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700">
        {icon}
      </div>

      <div>
        <p className="text-xs text-slate-500">{title}</p>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
          {value}
        </h3>
      </div>
    </div>
  );
}