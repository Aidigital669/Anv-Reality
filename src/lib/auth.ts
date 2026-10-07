import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Add your OAuth providers here, e.g., GoogleProvider
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Default Super Admin credentials for Anv Reeality CMS
        const validEmails = ["admin@anvrealty.com", "rajesh.sharma@anvrealty.com", "admin"];
        const validPasswords = ["admin123", "admin", "anvrealty2026"];

        if (
          validEmails.includes(credentials.email.toLowerCase()) &&
          validPasswords.includes(credentials.password)
        ) {
          return {
            id: "1",
            name: "Rajesh Sharma",
            email: credentials.email,
            role: "SUPER_ADMIN",
          };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    // signIn: "/login",
  },
};
