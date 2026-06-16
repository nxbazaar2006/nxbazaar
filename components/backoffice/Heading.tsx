interface Props {
  title: string;
  description?: string;
  align?: "left" | "center";
  compact?: boolean;
  inline?: boolean;
  gradient?: boolean;
}

export default function Heading({
  title,
  description,
  align = "left",
  compact = false,
  inline = false,
  gradient = false,
}: Props) {
  void gradient;

  return (
    <div
      className={`${
        inline
          ? "flex flex-wrap items-center gap-x-3 gap-y-1"
          : compact
          ? "space-y-1"
          : "space-y-2"
      } ${
        align === "center" ? "text-center" : "text-left"
      }`}
    >
      <h1
        className={`text-foreground font-semibold tracking-tight ${
          compact ? "text-xl md:text-2xl" : "text-2xl md:text-3xl"
        }`}
      >
        {title}
      </h1>

      {description && (
        <p
          className={`text-sm text-slate-600 dark:text-slate-400 ${
            inline ? "truncate" : "max-w-2xl"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
