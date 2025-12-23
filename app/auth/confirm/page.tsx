"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

export default function AuthConfirmPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuth = async () => {
      // Check for errors first
      const errorDescription = new URLSearchParams(window.location.search).get("error_description")
      if (errorDescription) {
        setError(errorDescription)
        setTimeout(() => router.push("/login?error=" + errorDescription), 2000)
        return
      }

      // Create a fresh Supabase client instance with session detection enabled
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            flowType: 'pkce',
            storage: {
              getItem: (key) => {
                const value = document.cookie
                  .split('; ')
                  .find(row => row.startsWith(`${key}=`))
                  ?.split('=')[1]
                return value ? decodeURIComponent(value) : null
              },
              setItem: (key, value) => {
                document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`
              },
              removeItem: (key) => {
                document.cookie = `${key}=; path=/; max-age=0`
              },
            },
          },
        }
      )

      console.log("Checking for session in URL hash...")

      // The client should automatically process the hash
      // Wait a moment for it to process
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Now check if we have a session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Session error:", sessionError)
        setError(sessionError.message)
        setTimeout(() => router.push("/login?error=" + sessionError.message), 2000)
        return
      }

      if (session) {
        console.log("Session detected! User:", session.user.email)

        // Store in localStorage to mark successful auth
        localStorage.setItem('just_authenticated', 'true')

        // Give it a bit more time to ensure everything is persisted
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Use window.location for a full page reload to ensure middleware picks up session
        console.log("Redirecting to home page...")
        window.location.href = "/"
      } else {
        console.error("No session found after processing URL")
        console.log("URL hash:", window.location.hash)
        setError("Failed to create session")
        setTimeout(() => router.push("/login?error=no_session"), 2000)
      }
    }

    handleAuth()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-destructive mb-4">Authentication error</div>
            <p className="text-sm text-muted-foreground">{error}</p>
          </>
        ) : (
          <>
            <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Signing you in...</p>
          </>
        )}
      </div>
    </div>
  )
}
