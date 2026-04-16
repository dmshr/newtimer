import { NextResponse } from "next/server";

export async function GET() {
  // Mengirimkan timestamp server dalam milidetik
  return NextResponse.json({ serverTime: Date.now() });
}