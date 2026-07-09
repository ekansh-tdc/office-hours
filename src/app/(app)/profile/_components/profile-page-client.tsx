'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Trash2, UserCog } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { PageHeading } from '~/components/page-heading'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card'
import {
  Field,
  FieldContent,
  FieldError,
  FieldTitle
} from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { deleteUser, updateUser } from '~/lib/auth-client'
import { toastErrorMessage, toastSuccessMessage } from '~/lib/toast-message'

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120)
})

type ProfileForm = z.infer<typeof profileSchema>

export function ProfilePageClient({
  user
}: {
  user: {
    name: string
    email: string
  }
}) {
  const router = useRouter()
  const [deletingAccount, setDeletingAccount] = useState(false)

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name
    }
  })

  async function submitProfile(values: ProfileForm) {
    const { error } = await updateUser({
      name: values.name
    })

    if (error) {
      toastErrorMessage(error.message ?? 'Failed to update profile')
      return
    }

    toastSuccessMessage('Profile updated')
    router.refresh()
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      'Delete your account and all tracking logs? This cannot be undone.'
    )
    if (!confirmed) return

    setDeletingAccount(true)
    const { error } = await deleteUser({
      callbackURL: '/login'
    })

    if (error) {
      setDeletingAccount(false)
      toastErrorMessage(error.message ?? 'Failed to delete account')
      return
    }

    router.push('/login')
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        title="Profile"
        description="Manage your account details."
        icon={UserCog}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.85fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={profileForm.handleSubmit(submitProfile)}
              className="flex max-w-md flex-col gap-6"
            >
              <Field orientation="vertical">
                <FieldContent>
                  <FieldTitle>Name</FieldTitle>
                  <Input
                    {...profileForm.register('name')}
                    aria-invalid={!!profileForm.formState.errors.name}
                  />
                  <FieldError errors={[profileForm.formState.errors.name]} />
                </FieldContent>
              </Field>

              <div>
                <Button
                  type="submit"
                  disabled={
                    profileForm.formState.isSubmitting ||
                    !profileForm.formState.isDirty
                  }
                >
                  {profileForm.formState.isSubmitting ? (
                    <Loader2 className="animate-spin" />
                  ) : null}
                  Save profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danger zone</CardTitle>
            <CardDescription>
              Delete your account, sessions, and tracking logs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              disabled={deletingAccount}
              onClick={handleDeleteAccount}
            >
              {deletingAccount ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Trash2 />
              )}
              Delete account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
