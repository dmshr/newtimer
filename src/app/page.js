"use client";

import BossList from "@/components/boss/BossList";

export default function HomePage() {
  return (
    <main
      style={{ paddingTop: "var(--header-height)" }}
      className="min-h-screen bg-[#0b0b0b] text-white px-3 md:px-5 transition-all duration-300"
    >
      <BossList />
    </main>
  );
}