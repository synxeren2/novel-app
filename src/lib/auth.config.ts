import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnUpload = nextUrl.pathname.startsWith("/upload");
      if (isOnUpload) {
        if (isLoggedIn) return true;
        return false;
      }
      return true;
    },
  },
  providers: [], // Google kaldırıldı, sadece Credentials (auth.ts içinde) kalacak
} satisfies NextAuthConfig;
