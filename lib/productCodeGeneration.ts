import {
  barcodeValueFromSku,
  generateCode128Barcode,
} from "@/lib/barcode";

type GenerateSkuInput = {
  vendorCode: string | null | undefined;
  productTitle: string | null | undefined;
  subCategory: string | null | undefined;
  color: string | null | undefined;
  size: string | null | undefined;
  number: number | string;
};

type GenerateProductCodeInput = {
  vendorCode: string | null | undefined;
  productTitle: string | null | undefined;
  date?: Date;
  number: number | string;
};

export function cleanSkuPart(value?: string | null) {
  const cleaned = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "");
  const fallback = cleaned.at(-1) || "X";

  return cleaned.slice(0, 3).padEnd(3, fallback);
}

export function cleanCode(value: string | null | undefined, fallback = "X") {
  const cleaned = value
    ?.trim()
    .replace(/[^a-z0-9]+/gi, "")
    .toUpperCase();

  return cleaned || fallback;
}

export function shortCode(
  value: string | null | undefined,
  length: number,
  fallback = "X"
) {
  const cleaned = cleanCode(value, fallback);

  return cleaned.padEnd(length, cleaned.at(-1) ?? "X").slice(0, length);
}

export function formatSerial(number: number | string, length = 3) {
  return String(number)
    .replace(/[^a-z0-9]+/gi, "")
    .toUpperCase()
    .padStart(length, "0")
    .slice(-length);
}

export function generateSKU(input: GenerateSkuInput) {
  const autoId = formatSerial(input.number, 3);

  return [
    input.vendorCode,
    input.subCategory,
    input.color,
    input.size,
    autoId,
  ]
    .map(cleanSkuPart)
    .filter(Boolean)
    .join("-");
}

export const generateSku = generateSKU;

export function formatDateCode(date = new Date()) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);

  return `${day}${month}${year}`;
}

export function productCodePrefix(input: Omit<GenerateProductCodeInput, "number">) {
  return [
    shortCode(input.vendorCode, 3, "VND"),
    shortCode(input.productTitle, 3, "PRD"),
    formatDateCode(input.date),
  ].join("-");
}

export function generateProductCode(
  input: GenerateProductCodeInput
): string;
export function generateProductCode(
  year: number | string,
  number: number | string
): string;
export function generateProductCode(
  inputOrYear: GenerateProductCodeInput | number | string,
  number?: number | string
) {
  if (typeof inputOrYear === "object") {
    return `${productCodePrefix(inputOrYear)}-${formatSerial(
      inputOrYear.number,
      3
    )}`;
  }

  return `PRD-${inputOrYear}-${formatSerial(number ?? 1, 4)}`;
}

export function generateBarcode(sku: string) {
  return barcodeValueFromSku(sku);
}

export async function generateBarcodeImage(barcode: string) {
  const png = await generateCode128Barcode(barcode);

  return `data:image/png;base64,${png.toString("base64")}`;
}
