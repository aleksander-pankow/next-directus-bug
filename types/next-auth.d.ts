import {type DefaultSession} from '@/types/next-auth';

declare module '@/types/next-auth' {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        accessToken: string,
        refreshToken?: string,
        error?: string,
        user: {
            id: string;
            first_name?: string;
            last_name?: string;
        } & DefaultSession['user'];
    }

    export interface User {
        id: string;
        name: string;
        email: string;
        accessToken: string;
        refreshToken?: string;
    }
}