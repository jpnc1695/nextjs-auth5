import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { signInSchema } from "./lib/zod";
import prisma from "./lib/prisma";
import bcryptjs from "bcryptjs";


const publicRoutes = ["/auth/signin", "/auth/signup"];
const authRoutes = ["/auth/signin", "/auth/signup"];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email", placeholder: "Email" },
        password: { label: "Senha", type: "Password", placeholder: "Senha" },
      },
      async authorize(credentials) {
        let user = null;

        const parseCredentials = signInSchema.safeParse(credentials);
        if (!parseCredentials.success) {
          console.error("Credencial inválida", parseCredentials.error.errors);
          return null;
        }

        user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user) {
          console.log("Credencial inválida");
          return null;
        }

        if (!user.password) {
          console.log(
            "Usuario sem senha. Provalvelmente está logado com outro provedor."
          );
          return null;
        }

        const isPasswordValid = await bcryptjs.compare(
          credentials.password as string,
          user.password
        );
        if (!isPasswordValid) {
          console.log("Invalid password");
          return null;
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      },
    }),
  ],

  callbacks: {
    authorized({ request: { nextUrl }, auth }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      // Allow access to public routes for all users
      if (publicRoutes.includes(pathname)) {
        return true;
      }

      // Redirect logged-in users away from auth routes
      if (authRoutes.includes(pathname)) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true; // Allow access to auth pages if not logged in
      }

      // Allow access if the user is authenticated
      return isLoggedIn;
    },

    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as string;
      }

      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },
});
