import { SupabaseClient } from "@supabase/supabase-js"
import crypto from "crypto"

// --- Caching ---

export function hashEntries(entries: Array<{ content: string; created_at: string }>): string {
  const content = entries.map((e) => `${e.content}|${e.created_at}`).join("||")
  return crypto.createHash("md5").update(content).digest("hex")
}

export async function getCachedStandup(
  supabase: SupabaseClient,
  userId: string,
  entriesHash: string
): Promise<string | null> {
  try {
    const { data } = await supabase
      .from("standup_cache")
      .select("content, created_at")
      .eq("user_id", userId)
      .eq("entries_hash", entriesHash)
      .single()

    if (!data) return null

    // Cache valid for 1 hour
    const cacheAge = Date.now() - new Date(data.created_at).getTime()
    if (cacheAge > 60 * 60 * 1000) return null

    return data.content
  } catch {
    // Table might not exist yet, gracefully return null
    return null
  }
}

export async function setCachedStandup(
  supabase: SupabaseClient,
  userId: string,
  entriesHash: string,
  content: string
): Promise<void> {
  try {
    await supabase.from("standup_cache").upsert(
      {
        user_id: userId,
        entries_hash: entriesHash,
        content,
        created_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
  } catch {
    // Table might not exist yet, fail silently
  }
}

// --- Rate Limiting ---

const DAILY_LIMIT = 20 // Max API calls per user per day

export async function checkRateLimit(
  supabase: SupabaseClient,
  userId: string,
  action: "standup" | "report"
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const today = new Date().toISOString().split("T")[0]

    // Get current count
    const { data } = await supabase
      .from("api_rate_limits")
      .select("count")
      .eq("user_id", userId)
      .eq("action", action)
      .eq("date", today)
      .single()

    const currentCount = data?.count || 0
    const remaining = Math.max(0, DAILY_LIMIT - currentCount)

    return { allowed: currentCount < DAILY_LIMIT, remaining }
  } catch {
    // Table might not exist, allow by default
    return { allowed: true, remaining: DAILY_LIMIT }
  }
}

export async function incrementRateLimit(
  supabase: SupabaseClient,
  userId: string,
  action: "standup" | "report"
): Promise<void> {
  try {
    const today = new Date().toISOString().split("T")[0]

    // Upsert: increment if exists, create with count=1 if not
    const { data } = await supabase
      .from("api_rate_limits")
      .select("count")
      .eq("user_id", userId)
      .eq("action", action)
      .eq("date", today)
      .single()

    if (data) {
      await supabase
        .from("api_rate_limits")
        .update({ count: data.count + 1 })
        .eq("user_id", userId)
        .eq("action", action)
        .eq("date", today)
    } else {
      await supabase.from("api_rate_limits").insert({
        user_id: userId,
        action,
        date: today,
        count: 1,
      })
    }
  } catch {
    // Table might not exist, fail silently
  }
}
