import Card from "@/components/ui/card";

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
    <Card
      className={`
        space-y-2
        ${align === "center" ? "text-center" : "text-left"}
      `}
    >
      <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h1>

      {description && (
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-2xl">
          {description}
        </p>
      )}
    </Card>
  );
}