import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { lat, lng } = await req.json();

    const API_KEY = process.env.OPENCAGE_API_KEY;

    const res = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${API_KEY}`
    );

    const data = await res.json();

    const components = data.results[0]?.components;

    return NextResponse.json({
      city:
        components?.city ||
        components?.town ||
        components?.village ||
        "",
      state: components?.state || "",
      country: components?.country || "",
      pincode: components?.postcode || "",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Geocode failed" },
      { status: 500 }
    );
  }
}
