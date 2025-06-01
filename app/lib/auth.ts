import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import mongodb from "./mongodb";
import { compare } from "bcrypt";

// Extend the built-in session types
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    role: string;
    fullName: string;
  }
  
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      fullName: string;
    }
  }
}

// Extend the built-in JWT types
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    role: string;
    fullName: string;
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const client = await mongodb;
          const db = client.db("WeRequestDB");
          
          // Check for user by either email or username
          const user = await db.collection("users").findOne({
            $or: [
              { email: credentials?.username },
              { username: credentials?.username }
            ]
          });

          if (!user) return null;

          const passwordsMatch = await compare(credentials?.password || '', user.password);

          if (!passwordsMatch) return null;

          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            fullName: user.fullName
          };
        } catch (error) {
          console.error('Error:', error);
          return null;
        }
      }
    }),
  ],
  pages: {
    signIn: "/", // Use your custom login page
    signOut: "/",
    error: "/",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.fullName = user.fullName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.fullName = token.fullName;
      }
      return session;
    },
  },
};