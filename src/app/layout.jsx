import { Suspense } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import "@/app/globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer"; // ✅ IMPORT FOOTER
import { SoundProvider } from "@/context/SoundContext";
import { InvasionProvider } from "@/context/InvasionContext";
import AuthProvider from "@/context/AuthProvider";
import { TimezoneProvider } from "@/context/TimezoneContext";
import TimeSync from "@/components/layout/TimeSync";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter" 
});

const mono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-mono" 
});

export const metadata = {
  title: "Kain 3",
  description: "Boss Timer Erica 1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* ✅ TAMBAHKAN flex flex-col min-h-screen AGAR FOOTER DI BAWAH */}
      <body className={`${inter.variable} ${mono.variable} bg-black text-white antialiased font-sans font-medium flex flex-col min-h-screen`}>
        <AuthProvider>
          <TimeSync /> 
          
          <SoundProvider>
            <TimezoneProvider> 
              <InvasionProvider>
                
                {/* Header */}
                <Suspense fallback={<div className="h-[60px] bg-black border-b border-zinc-900 w-full" />}>
                  <Header />
                </Suspense>
                
                {/* ✅ UBAH min-h-screen MENJADI flex-grow */}
                <main className="flex-grow">
                  {children}
                </main>

                {/* ✅ PASANG FOOTER */}
                <Footer />

              </InvasionProvider>
            </TimezoneProvider> 
          </SoundProvider>
          
        </AuthProvider>
      </body>
    </html>
  );
}
