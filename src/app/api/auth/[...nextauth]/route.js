import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        try {
          // 1. PERBAIKAN: Gunakan LOWER() agar pencarian username tidak case-sensitive
          const users = await sql`
            SELECT * FROM users WHERE LOWER(username) = LOWER(${credentials.username})
          `;
          const user = users[0];

          // Debugging (Bisa kamu hapus setelah login berhasil)
          if (!user) {
            console.log("❌ Login Attempt: User not found in database");
            return null; 
          }

          // 2. Bandingkan password (bcrypt compare otomatis menangani hash)
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordCorrect) {
            console.log("❌ Login Attempt: Wrong password for", user.username);
            return null;
          }

          // 3. PERBAIKAN: Kembalikan ID sebagai String (Penting untuk kestabilan JWT NextAuth)
          return {
            id: user.id.toString(),
            name: user.username,
            role: user.role,
          };
        } catch (error) {
          console.error("🔥 Auth Error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // Sesi berlaku 24 jam
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };