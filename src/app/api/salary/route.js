import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getAllSalaries, syncSalariesFromSheet } from "@/repositories/bossRepository";
import { pusherServer } from "@/lib/pusher";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getAllSalaries();
    return NextResponse.json(data || []);
  } catch (error) {
    console.error("🔥 GET Salary Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST() {
  const session = await getServerSession(authOptions);
  
  // Proteksi: Hanya Master yang bisa trigger update
  if (!session || session.user.role !== "Master") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    // 1. URL Spreadsheet kamu (Format CSV)
    const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRWrbINSQaq9foqc7fCszP8nsCO736Jqny8xtwNWFUrUd8xBfW_sV6StSpEpqROQhQvNsl4NPKkQd46/pub?gid=0&single=true&output=csv";
    
    const response = await fetch(SHEET_URL);
    const csvText = await response.text();
    
    // 2. Parsing CSV (Mendukung 6 Kolom: A sampai F)
    const rows = csvText.split("\n").slice(1); // Lewati baris header
    const dataArray = rows.map(row => {
      // Regex untuk memisahkan koma dengan aman
      const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      
      return { 
        member_name: cols[0]?.replace(/"/g, '').trim(),    // Kolom A
        last_week: cols[1]?.replace(/"/g, '').trim(),      // Kolom B
        current_salary: cols[2]?.replace(/"/g, '').trim(), // Kolom C
        debt: cols[3]?.replace(/"/g, '').trim(),           // Kolom D
        receivables: cols[4]?.replace(/"/g, '').trim(),    // Kolom E
        total_amount: cols[5]?.replace(/"/g, '').trim()    // Kolom F
      };
    }).filter(item => item.member_name); // Pastikan nama member tidak kosong

    // 3. Simpan ke Neon
    await syncSalariesFromSheet(dataArray);

    // 4. Sinyal ke Pusher
    await pusherServer.trigger("boss-timer-k3", "salary-updated", { message: "Salary data refreshed" });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("🔥 POST Salary Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}