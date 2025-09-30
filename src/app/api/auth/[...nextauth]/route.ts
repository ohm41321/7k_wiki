import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { usersDB } from "@/app/lib/users";
import bcrypt from 'bcryptjs';

// WARNING: This is a mock authentication setup for demonstration purposes.
// Do NOT use this in a production environment.
// Passwords are not hashed and are stored in-memory.

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username or Email", type: "text", placeholder: "YourUsername or test@example.com" },
        password: {  label: "Password", type: "password", placeholder: "password" }
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }
        
        // Find user by email or username
        let user = usersDB.findByEmail(credentials.username);
        if (!user) {
          user = usersDB.findByUsername(credentials.username);
        }

        // compare hashed password
        if (user && user.password && bcrypt.compareSync(credentials.password, user.password)) {
          return { id: user.id, name: user.name, email: user.email };
        } else {
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // token is a Record in runtime; narrow to allow adding id
        const t = token as unknown as Record<string, unknown>;
        t.id = user.id;
        return t as typeof token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const t = token as unknown as Record<string, unknown>;
        if (typeof t.id === 'string') {
          (session.user as Record<string, unknown>).id = t.id;
        }
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST }
