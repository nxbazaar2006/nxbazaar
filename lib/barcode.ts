import bwipjs from "bwip-js/node";

export function barcodeValueFromSku(sku: string) {
  const barcode = sku.trim();

  if (!barcode) {
    throw new Error("SKU is required to generate a barcode.");
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

