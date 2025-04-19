import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Admin users - in a real app, this would come from a database
const ADMIN_USERS = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@xmaagency.com",
    password: "password123", // In production, this would be hashed
  },
];

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // In production, you would check against your database
        const user = ADMIN_USERS.find(
          (user) =>
            user.email === credentials.email &&
            user.password === credentials.password,
        );

        return user || null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = "admin"; // Add role to token
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// Export the auth route handlers for Next.js API routes
export const { GET, POST } = handlers;
