import { redirect } from 'next/navigation'
import { getAuthSession } from '~/lib/auth'
import { ProfilePageClient } from './_components/profile-page-client'

export default async function ProfilePage() {
  const authSession = await getAuthSession()

  if (!authSession) {
    return redirect('/login')
  }

  return (
    <ProfilePageClient
      user={{
        name: authSession.user.name,
        email: authSession.user.email
      }}
    />
  )
}
