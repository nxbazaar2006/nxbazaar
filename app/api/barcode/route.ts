import { NextResponse } from "next/server";
import { generateCode128Barcode } from "@/lib/barcode";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text")?.trim();

  if (!text) {
    return NextResponse.json(
      { message: "Barcode text is required" },
      { status: 400 }
    );
  }

  try {
    const png = await generateCode128Barcode(text);

    return new NextResponse(new Uint8Array(png), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("BARCODE_GENERATION_ERROR", error);

    return NextResponse.json(
      { message: "Failed to generate barcode" },
      { status: 500 }
    );
  }
}
