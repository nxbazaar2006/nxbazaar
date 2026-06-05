import { createMarket, getMarkets } from "@/actions/market";
import { NextResponse } from "next/server";

export async function GET() {
  const response = await getMarkets();

  return NextResponse.json(response, {
    status: response.success ? 200 : 500,
  });
}

export async function POST(req: Request) {
  const response = await createMarket(await req.json());

  return NextResponse.json(response, {
    status: response.success ? 201 : 400,
  });
}
