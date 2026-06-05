const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export function formatINR(value: number | string | null | undefined) {
  return inrFormatter.format(Number(value ?? 0));
}
