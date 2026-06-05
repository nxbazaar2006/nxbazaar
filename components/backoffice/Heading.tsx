interface Props {
  title: string;
  description?: string;
  align?: "left" | "center";
}

export default function Heading({
  title,
  description,
  align = "left",
}: Props) {
  return (
    <div
      className={`space-y-2 ${
        align === "center" ? "text-center" : "text-left"
      }`}
    >
      <h1 className="bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 bg-clip-text text-xl font-semibold text-transparent md:text-2xl lg:text-3xl">
        {title}
      </h1>

      {description && (
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}
