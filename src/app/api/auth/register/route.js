import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { username, password, role } = await req.json();

    if (!username || !password || !role) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // 1. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Simpan ke database
    await sql`
      INSERT INTO users (username, password, role)
      VALUES (${username}, ${hashedPassword}, ${role})
    `;

    return NextResponse.json({ success: true, message: "User registered" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}