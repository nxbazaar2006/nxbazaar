import bwipjs from "bwip-js/node";

const CODE128_SAFE_TEXT = /^[\x20-\x7E]+$/;

export function barcodeValueFromSku(sku: string) {
  const barcode = sku.trim();

  if (!barcode) {
    throw new Error("SKU is required to generate a barcode.");
  }

  if (!CODE128_SAFE_TEXT.test(barcode)) {
    throw new Error("Code128 barcode text must contain printable ASCII only.");
  }

  return barcode;
}

export function getBarcodeImageUrl(barcode: string) {
  return `/api/barcode?text=${encodeURIComponent(barcodeValueFromSku(barcode))}`;
}

export async function generateCode128Barcode(barcode: string) {
  return bwipjs.toBuffer({
    bcid: "code128",
    text: barcodeValueFromSku(barcode),
    scale: 3,
    height: 18,
    includetext: true,
    textxalign: "center",
    paddingwidth: 10,
    paddingheight: 5,
  });
}

export function barcodePngDataUri(buffer: Buffer | Uint8Array) {
  return `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;
}
