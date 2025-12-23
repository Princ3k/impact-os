import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  const response = NextResponse.redirect(`${origin}/`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Handle token-based verification (magic link with token_hash)
  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    })

    if (error) {
      console.error('Auth callback error (token):', error)
      return NextResponse.redirect(`${origin}/login?error=${error.message}`)
    }

    console.log('Auth successful (token):', data.session?.user?.email)
    return response
  }

  // Handle PKCE code exchange
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error (code):', error)
      return NextResponse.redirect(`${origin}/login?error=${error.message}`)
    }

    console.log('Auth successful (code):', data.session?.user?.email)
    return response
  }

  // If there's no code or token, redirect to login
  console.error('No code or token_hash found in callback')
  return NextResponse.redirect(`${origin}/login?error=no_auth_params`)
}
