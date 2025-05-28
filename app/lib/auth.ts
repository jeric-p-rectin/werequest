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
  }
  
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
    }
  }
}

// Extend the built-in JWT types
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    role: string;
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const client = await mongodb;
          const db = client.db("WeRequestDB");
          const user = await db.collection("users").findOne({ 
            $or: [
              { username: credentials.username },
              { email: credentials.username }
            ]
          });

          if (!user) {
            return null;
          }

          // Use bcrypt to compare passwords
          
          const isPasswordValid = await compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("Authentication error:", error);
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
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.role = token.role;
      }
      return session;
    },
  },
};