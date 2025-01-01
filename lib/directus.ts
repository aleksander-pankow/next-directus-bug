import {createDirectus, rest, authentication, readItems, readMe, readCollection} from '@directus/sdk';
import {UserSchema} from '@/types/next-directus'
import {NextResponse} from "next/server";


const directus = createDirectus<{
    directus_users: UserSchema; // Указываем, что коллекция `users` использует тип `User`
}>(process.env.DIRECTUS_URL as string)
    .with(rest({credentials: 'include'}))
    .with(authentication('cookie', {credentials: 'include', autoRefresh: true}));
export default directus;
