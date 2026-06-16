function cleanSkuPart(value?: string | null) {
  const cleaned = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "");
  const fallback = cleaned.at(-1) || "X";

  return cleaned.slice(0, 3).padEnd(3, fallback);
}

export function generateSku({
  vendorCode,
  productTitle: _productTitle,
  subCategory,
  color,
  size,
  id,
}: {
  vendorCode: string;
  productTitle: string;
  subCategory: string;
  color?: string;
  size?: string;
  id: number;
}) {
  const autoId = String(id)
    .replace(/[^a-z0-9]+/gi, "")
    .toUpperCase()
    .padStart(3, "0")
    .slice(-3);

  return [
    vendorCode,
    subCategory,
    color,
    size,
    autoId,
  ]
    .map(cleanSkuPart)
    .filter(Boolean)
    .join("-");
}
