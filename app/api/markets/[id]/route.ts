import {
  deleteMarket,
  getMarketById,
  updateMarket,
} from "@/actions/market";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const response = await getMarketById(id);

  return NextResponse.json(response, {
    status: response.success ? 200 : 404,
  });
}

export async function PUT(req: Request, context: RouteContext) {
  const { id } = await context.params;
  const response = await updateMarket(id, await req.json());

  return NextResponse.json(response, {
    status: response.success ? 200 : 400,
  });
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const response = await deleteMarket(id);

  return NextResponse.json(response, {
    status: response.success ? 200 : 400,
  });
}
