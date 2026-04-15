import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = { 
  // Daftarkan halaman yang ingin diproteksi
  matcher: ["/", "/api/boss/:path*"] 
};