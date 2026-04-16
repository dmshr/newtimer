import { Suspense } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import "@/app/globals.css";
import Header from "@/components/layout/Header";
import { SoundProvider } from "@/context/SoundContext";
import { InvasionProvider } from "@/context/InvasionContext";
import AuthProvider from "@/context/AuthProvider";
import TimeSync from "@/components/layout/TimeSync"; // ✅ Import komponen sync baru

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
  description: "Boss Timer DOGE2",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${mono.variable} bg-black text-white antialiased font-sans font-medium`}>
        <AuthProvider>
          {/* ✅ Tambahkan TimeSync di sini agar jam server tersinkronisasi otomatis */}
          <TimeSync /> 
          
          <SoundProvider>
            <InvasionProvider>
              
              <Suspense fallback={<div className="h-[110px] bg-black w-full" />}>
                <Header />
              </Suspense>
              
              {/* Main content wrapping */}
              <main className="min-h-screen">
                {children}
              </main>

            </InvasionProvider>
          </SoundProvider>
        </AuthProvider>
      </body>
    </html>
  );
}