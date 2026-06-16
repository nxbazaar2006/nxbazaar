"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { importProductsFromFile } from "@/actions/productImport";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const TEMPLATE_HEADERS = [
  "title",
  "category",
  "subCategory",
  "price",
  "salePrice",
  "costPrice",
  "color",
  "size",
  "stock",
  "description",
  "imageUrl",
  "tags",
  "unit",
  "isWholesale",
];

export default function ProductImportButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function downloadTemplate() {
    const blob = new Blob([`${TEMPLATE_HEADERS.join(",")}\n`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "product-import-template.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function importProducts() {
    if (!file) {
      toast.error("Please select a CSV or Excel file.");
      return;
    }

    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const result = await importProductsFromFile(formData);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="dashboard"
          className="rounded-2xl px-5 text-white shadow-sm"
        >
          <FileSpreadsheet />
          CSV / Excel Upload
        </Button>
      </DialogTrigger>

      <DialogContent className="text-slate-950 dark:text-white">
        <DialogHeader>
          <DialogTitle>Import Products</DialogTitle>
          <DialogDescription>
            Upload a CSV, XLSX or XLS file. Each row creates one product with a
            default variant, generated SKU and Code 128 barcode.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            disabled={isPending}
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="bg-white text-slate-950 dark:bg-slate-900 dark:text-white"
          />

          <p className="text-xs leading-5 text-slate-600 dark:text-slate-400">
            Required columns: title, category, price. Use category and
            subCategory IDs or names. Maximum 500 rows and 5 MB per upload.
          </p>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="outline" onClick={downloadTemplate}>
            <Download />
            Download CSV Template
          </Button>

          <Button
            type="button"
            variant="dashboard"
            disabled={isPending}
            onClick={importProducts}
            className="text-white"
          >
            <Upload />
            {isPending ? "Importing..." : "Import Products"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
