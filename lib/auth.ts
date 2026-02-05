import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Demo",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const email = credentials.email as string;

        try {
          // Find or create demo user
          let user = await db.user.findUnique({
            where: { email },
          });

          if (!user) {
            user = await db.user.create({
              data: {
                email,
                name: email.split("@")[0],
              },
            });

            // Create initial study streak
            await db.studyStreak.create({
              data: { userId: user.id },
            });
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Auth error:", error);
          // Fallback: return a temporary user without DB
          return {
            id: email,
            email: email,
            name: email.split("@")[0],
          };
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
});
