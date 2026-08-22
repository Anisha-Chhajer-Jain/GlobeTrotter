import { getServerSession, type NextAuthOptions, type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "./prisma";
import { verifyPassword } from "./auth";
import { AppError } from "./errors";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as any),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    signOut: "/logout",
    newUser: "/signup",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new AppError("Email and password are required", 400);
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user) {
          throw new AppError("Invalid email or password", 401);
        }

        if (!user.password) {
          throw new AppError("Please sign in with the provider used during signup", 401);
        }

        const isPasswordValid = await verifyPassword(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new AppError("Invalid email or password", 401);
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          currency: user.currency,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.currency = (user as any).currency;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      // Merge in fields pushed from the client via useSession().update(...) —
      // without this, profile edits (name/photo/email/currency) only take
      // effect after the next full login, since the JWT itself is otherwise
      // only populated once at sign-in.
      if (trigger === "update" && session) {
        if (session.name !== undefined) token.name = session.name;
        if (session.email !== undefined) token.email = session.email;
        if (session.image !== undefined) token.picture = session.image;
        if (session.currency !== undefined) token.currency = session.currency;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        session.user.currency = token.currency;
        session.user.name = token.name ?? null;
        session.user.email = token.email ?? null;
        session.user.image = token.picture ?? null;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true;
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.currency) {
        await prisma.user.update({
          where: { id: user.id },
          data: { currency: "USD" },
        });
      }
    },
  },
};

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      email: true,
      image: true,
      bio: true,
      phone: true,
      city: true,
      country: true,
      currency: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new AppError("Authentication required", 401);
  }
  return user;
}
