import "@/app/globals.css";
import Header from "@/components/layout/Header";

export const metadata = {
  title: "Boss Timer",
  description: "Realtime Boss Tracking System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased font-sans">
        <Header />
        {children}
      </body>
    </html>
  );
}