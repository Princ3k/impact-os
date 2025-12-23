import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? {
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
    } : undefined,
  },
})

export type Entry = {
  id: string
  user_id: string
  content: string
  created_at: string
}

export type Report = {
  id: string
  user_id: string
  type: 'weekly' | 'one_on_one'
  content: string
  created_at: string
}
