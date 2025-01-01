import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { options } from './api/auth/[...nextauth]/options';
import {readItems, refresh, withToken} from "@directus/sdk";
import directus from "@/lib/directus";

export default async function Home() {
  const session = await getServerSession(options);
  if (!session) {
    redirect('/login');
  }
  await directus.request(refresh())
  console.log('SESSION:', session)
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
          Welcome, {session.user.name}!
        </h1>
      </main>
  );
}
