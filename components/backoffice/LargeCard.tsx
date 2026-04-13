"use client";

interface Props {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

export default function LargeCard({ title, value, icon }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-6 
      bg-white/60 dark:bg-slate-800/60 
      backdrop-blur-xl border border-slate-200 dark:border-slate-700
      shadow-lg hover:shadow-xl transition-all">

      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-pink-500/10 opacity-20" />

      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h2 className="text-3xl font-bold mt-2 text-slate-800 dark:text-white">
            {value}
          </h2>
        </div>

        {icon && (
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}