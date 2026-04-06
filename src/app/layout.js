import { Suspense } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import "@/app/globals.css";
import Header from "@/components/layout/Header";
import { SoundProvider } from "@/context/SoundContext";
import { InvasionProvider } from "@/context/InvasionContext";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter" 
});

const mono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-mono" 
});

export const metadata = {
  title: "Kain Boss Tracker",
  description: "Advanced Realtime Boss Tracking System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* ✅ Tambahkan variabel font di sini agar Tailwind bisa membacanya */}
      <body className={`${inter.variable} ${mono.variable} bg-black text-white antialiased font-sans font-medium`}>
        <SoundProvider>
          <InvasionProvider>
            
            <Suspense fallback={<div className="h-[110px] bg-black w-full" />}>
              <Header />
            </Suspense>
            
            {children}

          </InvasionProvider>
        </SoundProvider>
      </body>
    </html>
  );
}