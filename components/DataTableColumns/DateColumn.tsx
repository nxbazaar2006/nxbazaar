import { TableRowProps } from "@/types/table";

export default function DateColumn<T>({
  row,
  accessorKey,
}: TableRowProps<T>) {
  const value = row.getValue(accessorKey);

  if (!value) {
    return <span className="text-muted-foreground">—</span>;
  }

  const date = new Date(String(value));

  if (isNaN(date.getTime())) {
    return <span className="text-destructive">Invalid Date</span>;
  }

  return (
    <div className="flex flex-col leading-tight">
      <span className="font-medium">
        {date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </span>
      <span className="text-xs text-muted-foreground">
        {date.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
}