import { NextResponse } from "next/server";

// ✅ Memaksa API ini untuk selalu dijalankan secara realtime (tidak statis)
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { serverTime: Date.now() },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    }
  );
}