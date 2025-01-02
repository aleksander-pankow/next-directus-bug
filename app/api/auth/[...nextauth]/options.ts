import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import directus from "@/lib/directus";
import {readMe, refresh, withToken} from "@directus/sdk";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

const ACCESS_TOKEN_TTL = parseInt(process.env.ACCESS_TOKEN_TTL || "60000", 10); // 1 minute (in ms)
const REFRESH_TOKEN_TTL = parseInt(process.env.REFRESH_TOKEN_TTL || "604800000", 10); // 7 days (in ms)

async function refreshTokens(token: any) {
  try {
    console.log("Refreshing tokens with refresh token:", token.refreshToken);
    const refreshedTokens = await directus.request(refresh("json", token.refreshToken));
    console.log("Refreshed tokens:", refreshedTokens);

    if (!refreshedTokens?.access_token) {
      throw new Error("No access token returned by refresh.");
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token || token, // Use old refreshToken if no new one
      accessTokenExpires: Date.now() + ACCESS_TOKEN_TTL,
      refreshTokenExpires: Date.now() + REFRESH_TOKEN_TTL,
    };
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) throw new Error("Email address or password is empty");

        const res = await fetch(process.env.DIRECTUS_URL+"/auth/login", {
          method: "POST",
          body: JSON.stringify(credentials),
          headers: { "Content-Type": "application/json" },
        });

        const user = await res.json();

        if (!res.ok || !user.data) {
          throw new Error("Email address or password is invalid");
        }

        return user;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: any; }) {
      // Initial sign-in
      if (user) {
        return {
          accessToken: user.data.access_token,
          refreshToken: user.data.refresh_token,
          accessTokenExpires: Date.now() + ACCESS_TOKEN_TTL,
          refreshTokenExpires: Date.now() + REFRESH_TOKEN_TTL,
          userState: user.data, // Initial user data
        }
      }

      // Check if access token is expired
      // @ts-ignore
      if (Date.now() < token.accessTokenExpires) {
        console.log("**** returning previous token ******");
        return token;
      }

      // Access token has expired, try to update it
      console.log("**** Update Refresh token ******");
      //return token;
      return refreshTokens(token);
    },
    async session({ session, token }: { session: Session; token: any }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.expiresIn = token.accessTokenExpires;
      session.error = token.error;

      if (token.error === "RefreshTokenError") {
        console.error("Session refresh failed. User needs to reauthenticate.");
      }

      return session;
    }

  },
};
