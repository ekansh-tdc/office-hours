'use client'

import { apiKeyClient } from '@better-auth/api-key/client'
import {
  adminClient,
  inferAdditionalFields,
  lastLoginMethodClient,
  magicLinkClient
} from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import type { auth } from './auth'

export const {
  signIn,
  signOut,
  getLastUsedLoginMethod,
  apiKey,
  updateUser,
  deleteUser
} = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    magicLinkClient(),
    adminClient(),
    lastLoginMethodClient(),
    apiKeyClient()
  ]
})
