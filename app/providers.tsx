// app/providers.tsx
'use client'

import { GoogleOAuthProvider } from '@react-oauth/google'
import AuthBootstrap from '@/components/AuthBootstrap'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <AuthBootstrap />
      {children}
    </GoogleOAuthProvider>
  )
}
