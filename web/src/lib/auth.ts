import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("User does not exist or signed up via Google");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
        token.avatar = user.avatar;
        token.name = user.name;
      } else if (token.email) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true, phone: true, avatar: true, name: true }
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.phone = dbUser.phone;
          token.avatar = dbUser.avatar;
          token.name = dbUser.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.phone = token.phone;
        session.user.avatar = token.avatar;
        session.user.name = token.name;
      }
      return session;
    },
    async signIn({ account, profile, user }) {
      if (account?.provider === "google") {
        if (!profile?.email) {
          throw new Error("No email returned from Google");
        }

        let dbUser = await db.user.findUnique({
          where: { email: profile.email },
        });

        if (!dbUser) {
          dbUser = await db.user.create({
            data: {
              name: profile.name || "Google User",
              email: profile.email,
              role: "BUYER",
              avatar: profile.image || (profile as Record<string, string>).picture || null,
            },
          });
        }

        user.id = dbUser.id;
        user.role = dbUser.role;
        user.phone = dbUser.phone;
        user.avatar = dbUser.avatar;
        user.name = dbUser.name;
      }
      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
