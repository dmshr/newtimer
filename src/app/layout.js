import { Suspense } from "react";
import "@/app/globals.css";
import Header from "@/components/layout/Header";
import { SoundProvider } from "@/context/SoundContext";

export const metadata = {
  title: "Kain Boss Tracker",
  description: "Advanced Realtime Boss Tracking System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased font-sans font-medium">
        <SoundProvider>
          {/* ✅ WAJIB: Header dibungkus Suspense karena menggunakan useSearchParams */}
          <Suspense fallback={<div className="h-[110px] bg-black w-full" />}>
            <Header />
          </Suspense>
          
          {children}
        </SoundProvider>
      </body>
    </html>
  );
}