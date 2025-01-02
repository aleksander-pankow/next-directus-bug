import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { options } from './api/auth/[...nextauth]/options';
import {readItems, refresh, withToken} from "@directus/sdk";
import directus from "@/lib/directus";
import {signOut} from "next-auth/react";

export default async function Home() {
  const session = await getServerSession(options);
    if (!session || session.error === "RefreshAccessTokenError") {
        redirect("/login");
    }

    console.log("SESSION:", session);

    const caseRecord = await directus.request(
        withToken(
            session.accessToken,
            // @ts-ignore
            readItems("Case", {
                fields: ['*']
            })
        )
    );
    console.log('Case ', caseRecord);
  return (
      <main>
        <h1>
          Welcome!
        </h1>
      </main>
  );
}
