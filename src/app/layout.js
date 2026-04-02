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
          <Header />
          {children}
        </SoundProvider>
      </body>
    </html>
  );
}