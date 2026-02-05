// components/AuthBootstrap.tsx
'use client'

import { useEffect } from 'react'
import axios from '@/utils/axios'
import { useAuthStore } from '@/stores/useAuthStore'
import { buildClientHeaders } from '@/utils/authHeader'

export default function AuthBootstrap() {
  const {
    hydrated,
    access_token,
    refresh_token,
    user,
    setSession,
    clearSession,
  } = useAuthStore()

  useEffect(() => {
    if (!hydrated) return

    // If no refresh token, nothing to do.
    if (!refresh_token) return

    // If you want: only refresh on load when access_token is missing
    // If you want always-refresh-on-load, remove this if condition.
    if (access_token) return

    const run = async () => {
      try {
        const res = await axios.post(
          '/api/auth/refresh',
          { refresh_token },
          { headers: buildClientHeaders() }
        )

        const { access_token: newAccess, refresh_token: newRefresh, user: userPatch } = res.data.data
        const mergedUser = userPatch ? (user ? { ...user, ...userPatch } : userPatch) : user
        setSession(newAccess, newRefresh, mergedUser)
      } catch {
        clearSession()
      }
    }

    run()
  }, [hydrated, access_token, refresh_token, user, setSession, clearSession])

  return null
}
