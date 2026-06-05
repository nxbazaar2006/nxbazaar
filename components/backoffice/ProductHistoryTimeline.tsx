import type { ProductHistoryItem } from "@/actions/product";
import GlassCard from "@/components/GlassCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  history: ProductHistoryItem[];
};

function formatValue(value: string | null) {
  if (!value) return "-";

  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

function formatAction(action: string) {
  return action
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export default function ProductHistoryTimeline({ history }: Props) {
  return (
    <GlassCard className="max-w-7xl mx-auto space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Product History</h2>
        <p className="text-sm text-slate-600 dark:text-gray-300">
          Product, variant, price, stock, status, and image changes.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-600 dark:border-white/10 dark:text-gray-300">
          No product history found.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Field</TableHead>
              <TableHead>Old Value</TableHead>
              <TableHead>New Value</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>Changed By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(entry.createdAt))}
                </TableCell>
                <TableCell className="font-medium">
                  {formatAction(entry.action)}
                </TableCell>
                <TableCell>{entry.field ?? "-"}</TableCell>
                <TableCell className="max-w-64 whitespace-pre-wrap break-words text-xs">
                  {formatValue(entry.oldValue)}
                </TableCell>
                <TableCell className="max-w-64 whitespace-pre-wrap break-words text-xs">
                  {formatValue(entry.newValue)}
                </TableCell>
                <TableCell className="text-xs">
                  {entry.sku ?? entry.variantId ?? "-"}
                </TableCell>
                <TableCell className="text-xs">
                  <div>{entry.changedByUserCode ?? entry.changedByUserId ?? "-"}</div>
                  <div className="text-muted-foreground">
                    {entry.changedByRole ?? "-"}
                    {entry.sellerCode ? ` / ${entry.sellerCode}` : ""}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </GlassCard>
  );
}
