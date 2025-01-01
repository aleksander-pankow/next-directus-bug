import type {NextAuthOptions} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import {Session} from 'next-auth';
import directus from '@/lib/directus';
import {readMe, withToken} from '@directus/sdk';
import {JWT} from 'next-auth/jwt';

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: 'Credentials',
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials) throw new Error('Email address or password is empty');
        // Add logic here to look up the user from the credentials supplied
        const user = await directus.login(credentials.email, credentials.password);
        if (user) {
          console.log(user)
          return user as any;
        } else {
          throw new Error('Email address or password is invalid');
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({
                token,
                user,
                account,
              }: {
      token: JWT;
      user: any;
      account: any;
    }) {
      if (account && user) {
        const userData = await directus.request(
            withToken(
                user.access_token as string,
                readMe({
                  fields: ['id', 'first_name', 'last_name'],
                })
            )
        );
        return {
          ...token,
          accessToken: user.access_token,
          user: userData,
        };
      }
      return token;
    },
    async session({session, token}: { session: Session; token: any }) {
      session.accessToken = token.accessToken;
      session.user = token.user;
      return session;
    },
  },
};
