"use client";

interface Props {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

export default function LargeCard({
  title,
  value,
  icon,
  className,
}: Props) {
  return (
    <div
      className={`
        dashboard-stat-card min-w-0 relative min-h-32 overflow-hidden
        ${className ?? ""}
      `}
    >
      <div className="relative z-10 flex items-center justify-between p-5">
        <div className="min-w-0">
          <p className="text-foreground text-xs font-semibold uppercase tracking-wide">
            {title}
          </p>

          <h2 className="text-foreground mt-2 truncate text-2xl font-semibold tracking-tight sm:text-3xl">
            {value}
          </h2>
        </div>

        {icon && (
          <div className="soft-button soft-icon-btn shrink-0">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
