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
      <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold">
        {title}
      </h1>

      {description && (
        <p className="text-sm text-muted-foreground max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
}