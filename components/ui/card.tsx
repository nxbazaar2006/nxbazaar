import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className }: Props) {
  return (
    <div
      className={cn(
        "liquid-glass-card neumorphic-card p-5",
        className
      )}
    >
      {children}
    </div>
  );
}
