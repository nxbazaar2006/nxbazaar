import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className }: Props) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm transition-colors hover:bg-muted/30",
        className
      )}
    >
      {children}
    </div>
  );
}
