import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import {
  barcodePngDataUri,
  barcodeValueFromSku,
  generateCode128Barcode,
} from "@/lib/barcode";

const labelRequestSchema = z.object({
  variantIds: z.array(z.string().trim().min(1)).default([]),
  codes: z.array(z.string().trim().min(1)).default([]),
});

type LabelVariant = Awaited<ReturnType<typeof findLabelVariants>>[number];

function escapeHtml(value: string | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function splitParam(value: string | null) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function findLabelVariants(input: z.infer<typeof labelRequestSchema>) {
  if (input.variantIds.length === 0 && input.codes.length === 0) {
    return [];
  }

  const filters = [
    ...(input.variantIds.length ? [{ id: { in: input.variantIds } }] : []),
    ...(input.codes.length
      ? [
          { barcode: { in: input.codes } },
          { sku: { in: input.codes } },
          { productCode: { in: input.codes } },
        ]
      : []),
  ];

  return db.productVariant.findMany({
    where: {
      OR: filters,
    },
    include: {
      product: {
        select: {
          title: true,
          productCode: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

async function labelMarkup(variant: LabelVariant) {
  const barcode = barcodeValueFromSku(variant.barcode ?? variant.sku ?? "");
  const image = barcodePngDataUri(await generateCode128Barcode(barcode));
  const productCode = variant.product.productCode ?? variant.productCode ?? "";

  return `
    <section class="label">
      <div class="title">${escapeHtml(variant.product.title)}</div>
      <div class="variant">${escapeHtml(variant.title)}</div>
      <img src="${image}" alt="${escapeHtml(barcode)}" />
      <div class="code">${escapeHtml(barcode)}</div>
      <div class="meta">
        <span>SKU: ${escapeHtml(variant.sku)}</span>
        <span>Product: ${escapeHtml(productCode)}</span>
      </div>
    </section>
  `;
}

async function renderLabels(variants: LabelVariant[]) {
  const labels = await Promise.all(variants.map(labelMarkup));

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Barcode Labels</title>
  <style>
    @page { size: 60mm 40mm; margin: 3mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #fff;
      color: #111;
      font-family: Arial, Helvetica, sans-serif;
    }
    .label {
      width: 54mm;
      height: 34mm;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.2mm;
      overflow: hidden;
      text-align: center;
    }
    .title {
      width: 100%;
      font-size: 10px;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .variant {
      width: 100%;
      font-size: 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    img {
      width: 48mm;
      height: 15mm;
      object-fit: contain;
    }
    .code {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0;
    }
    .meta {
      width: 100%;
      display: flex;
      justify-content: space-between;
      gap: 2mm;
      font-size: 6.5px;
      line-height: 1.1;
    }
    .meta span {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  </style>
</head>
<body>
${labels.join("\n")}
</body>
</html>`;
}

async function labelsResponse(input: z.infer<typeof labelRequestSchema>) {
  const variants = await findLabelVariants(input);

  if (variants.length === 0) {
    return NextResponse.json(
      { success: false, error: "No variants found for barcode labels" },
      { status: 404 }
    );
  }

  return new NextResponse(await renderLabels(variants), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = labelRequestSchema.safeParse({
      variantIds: splitParam(searchParams.get("variantIds")),
      codes: splitParam(searchParams.get("codes")),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid label request", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    return labelsResponse(parsed.data);
  } catch (error) {
    console.error("BARCODE_LABEL_ERROR", error);

    return NextResponse.json(
      { success: false, error: "Failed to generate barcode labels" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const parsed = labelRequestSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid label request", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    return labelsResponse(parsed.data);
  } catch (error) {
    console.error("BARCODE_LABEL_ERROR", error);

    return NextResponse.json(
      { success: false, error: "Failed to generate barcode labels" },
      { status: 500 }
    );
  }
}
