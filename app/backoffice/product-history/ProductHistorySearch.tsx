"use client";

import { FormEvent, useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import {
  searchProductHistory,
  type ProductHistorySearchResult,
} from "./actions";

function formatValue(value: string | null) {
  if (!value) return "-";

  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ProductHistorySearch() {
  const inputRef = useRef<HTMLInputElement>(null);
  const barcodePrintRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<ProductHistorySearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const barcodeText =
    result?.matchedVariant?.barcode ??
    result?.variants[0]?.barcode ??
    result?.product.productCode ??
    query.trim();

  const barcodeImageUrl = useMemo(() => {
    if (!barcodeText) return "";

    return `/api/barcode?text=${encodeURIComponent(barcodeText)}`;
  }, [barcodeText]);

  const handlePrintBarcode = () => window.print();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const scanCode = query.trim();

    if (!scanCode) return;

    startTransition(async () => {
      const response = await searchProductHistory(scanCode);

      if (!response.success) {
        setResult(null);
        setError(response.error);
        inputRef.current?.select();
        return;
      }

      setError(null);
      setResult(response.data);
      inputRef.current?.select();
    });
  }

  const displayVariant = result?.matchedVariant ?? result?.variants[0] ?? null;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 text-slate-950 dark:text-white sm:p-6">
      <div>
        <h1 className="text-foreground text-2xl font-semibold">Product History</h1>
      </div>

      <form onSubmit={handleSubmit} className="border bg-card text-card-foreground shadow-sm flex flex-col gap-3 rounded-3xl p-3 sm:flex-row">
        <input
          ref={inputRef}
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Scan SKU / Barcode / Product Code"
          className="border bg-background text-foreground shadow-xs min-h-11 flex-1 px-4 text-sm placeholder:text-slate-500 dark:placeholder:text-white/45"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 min-h-11 rounded-2xl px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Searching..." : "Search"}
        </button>
      </form>

      {error ? (
        <div className="rounded-2xl border border-red-400/40 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-100">
          {error}
        </div>
      ) : null}

      {result ? (
        <>
          <section className="border bg-card text-card-foreground shadow-sm grid gap-4 rounded-3xl p-4 md:grid-cols-3">
            <div>
              <div className="text-xs uppercase text-slate-500 dark:text-white/50">Product</div>
              <div className="mt-1 font-medium">{result.product.title}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-slate-500 dark:text-white/50">Product Code</div>
              <div className="mt-1 font-medium">
                {result.product.productCode ?? displayVariant?.productCode ?? "-"}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase text-slate-500 dark:text-white/50">SKU / Barcode</div>
              <div className="mt-1 text-sm">
                <div>{displayVariant?.sku ?? "-"}</div>
                <div className="text-slate-600 dark:text-white/60">{displayVariant?.barcode ?? "-"}</div>
              </div>
            </div>
            {barcodeImageUrl ? (
              <div className="md:col-span-2">
                <div className="text-xs uppercase text-slate-500 dark:text-white/50">Scannable Barcode</div>
                <div className="border bg-card text-card-foreground shadow-sm mt-2 rounded-3xl bg-white p-3">
                  <Image
                    src={barcodeImageUrl}
                    alt={barcodeText}
                    width={420}
                    height={150}
                    unoptimized
                    className="h-auto w-full max-w-[420px]"
                  />
                </div>
              </div>
            ) : null}
            <div className="flex items-end justify-start">
              <button
                type="button"
                onClick={handlePrintBarcode}
                disabled={!barcodeText}
                className="bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 min-h-11 rounded-2xl px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Print Barcode
              </button>
            </div>
          </section>

          <div className="sr-only print:block">
            <div ref={barcodePrintRef} className="w-[320px] rounded-2xl border border-black p-4 text-center">
              <div className="text-lg font-semibold">{result.product.title}</div>
              <div className="mt-1 text-sm text-slate-700">
                {barcodeText}
              </div>
              {barcodeImageUrl ? (
                <Image
                  src={barcodeImageUrl}
                  alt={barcodeText}
                  width={320}
                  height={120}
                  unoptimized
                  className="mx-auto mt-3 h-auto w-full"
                />
              ) : null}
            </div>
          </div>

          <div className="border bg-card shadow-sm overflow-x-auto rounded-3xl">
            <table className="w-full min-w-[960px] border-collapse text-sm">
              <thead className="bg-white/45 text-left text-xs uppercase text-slate-600 backdrop-blur-xl dark:bg-white/10 dark:text-white/60">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Field</th>
                  <th className="p-3">Old Value</th>
                  <th className="p-3">New Value</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Changed By</th>
                  <th className="p-3">Role</th>
                </tr>
              </thead>
              <tbody>
                {result.history.length === 0 ? (
                  <tr>
                    <td className="p-4 text-center text-slate-600 dark:text-white/60" colSpan={8}>
                      No product history found.
                    </td>
                  </tr>
                ) : (
                  result.history.map((entry) => (
                    <tr key={entry.id} className="border-t border-white/50 align-top transition hover:bg-white/35 dark:border-white/10 dark:hover:bg-white/5">
                      <td className="p-3 text-xs text-slate-600 dark:text-white/70">
                        {formatDate(entry.createdAt)}
                      </td>
                      <td className="p-3 font-medium">{entry.action}</td>
                      <td className="p-3">{entry.field ?? "-"}</td>
                      <td className="max-w-80 whitespace-pre-wrap break-words p-3 text-xs text-slate-700 dark:text-white/75">
                        {formatValue(entry.oldValue)}
                      </td>
                      <td className="max-w-80 whitespace-pre-wrap break-words p-3 text-xs text-slate-700 dark:text-white/75">
                        {formatValue(entry.newValue)}
                      </td>
                      <td className="p-3 text-xs">{entry.sku ?? "-"}</td>
                      <td className="p-3 text-xs">
                        {entry.changedByUserCode ?? entry.changedByUserId ?? "-"}
                      </td>
                      <td className="p-3 text-xs">
                        {entry.changedByRole ?? "-"}
                        {entry.sellerCode ? ` / ${entry.sellerCode}` : ""}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}
