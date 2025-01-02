import {createDirectus, rest, authentication, readItems, readMe, readCollection, refresh} from '@directus/sdk';
import {UserSchema} from '@/types/next-directus'
import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {options} from "@/app/api/auth/[...nextauth]/options";
import {redirect} from "next/navigation";


const directus = createDirectus<{
    directus_users: UserSchema; // Указываем, что коллекция `users` использует тип `User`
}>(process.env.DIRECTUS_URL as string)
    .with(authentication('json', {credentials: 'include'})).with(rest({credentials:'include'}));
export default directus;