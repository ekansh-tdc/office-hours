import { redirect } from 'next/navigation'
import { env } from '~/env'
import { getAuthSession } from '~/lib/auth'
import { ApiKeysPageClient } from './_components/api-keys-page-client'

export default async function ApiKeysPage() {
  const authSession = await getAuthSession()

  if (!authSession) {
    return redirect('/login')
  }

  return <ApiKeysPageClient apiBaseUrl={env.BETTER_AUTH_URL} />
}
