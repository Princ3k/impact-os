import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextRequest, NextResponse } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import {
  hashEntries,
  getCachedStandup,
  setCachedStandup,
  checkRateLimit,
  incrementRateLimit,
} from "@/lib/api-utils"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client
    let response = NextResponse.next()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({ name, value: "", ...options })
          },
        },
      }
    )

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Check rate limit
    const { allowed, remaining } = await checkRateLimit(supabase, userId, "standup")
    if (!allowed) {
      return NextResponse.json(
        { error: "Daily limit reached. Try again tomorrow.", remaining: 0 },
        { status: 429 }
      )
    }

    // Fetch entries and categorize by date
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const twoDaysAgo = new Date(yesterday)
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 1)

    const { data: allEntries, error: fetchError } = await supabase
      .from("entries")
      .select("content, created_at")
      .eq("user_id", userId)
      .gte("created_at", twoDaysAgo.toISOString())
      .order("created_at", { ascending: false })

    if (fetchError) {
      return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 })
    }

    if (!allEntries || allEntries.length === 0) {
      return NextResponse.json(
        { content: "No work entries found.\n\nLog your work to generate a daily standup.", remaining },
        { status: 200 }
      )
    }

    // Check cache before calling AI
    const entriesHash = hashEntries(allEntries)
    const cachedContent = await getCachedStandup(supabase, userId, entriesHash)
    if (cachedContent) {
      return NextResponse.json({
        content: cachedContent,
        cached: true,
        remaining,
      })
    }

    // Categorize entries by date
    const todayEntries: typeof allEntries = []
    const yesterdayEntries: typeof allEntries = []
    const olderEntries: typeof allEntries = []

    allEntries.forEach((entry) => {
      const entryDate = new Date(entry.created_at)
      const entryDay = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate())

      if (entryDay.getTime() === today.getTime()) {
        todayEntries.push(entry)
      } else if (entryDay.getTime() === yesterday.getTime()) {
        yesterdayEntries.push(entry)
      } else {
        olderEntries.push(entry)
      }
    })

    // Format entries by category
    const formatEntries = (entries: typeof allEntries) => {
      return entries
        .map((entry) => {
          const time = new Date(entry.created_at).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })
          return `- ${entry.content} (${time})`
        })
        .join("\n")
    }

    let yesterdaySection = ""
    if (yesterdayEntries.length > 0) {
      yesterdaySection = `YESTERDAY:\n${formatEntries(yesterdayEntries)}`
    } else if (olderEntries.length > 0) {
      yesterdaySection = `RECENT:\n${formatEntries(olderEntries.slice(0, 2))}`
    } else {
      yesterdaySection = "YESTERDAY: None logged"
    }

    let todaySection = ""
    if (todayEntries.length > 0) {
      todaySection = `TODAY:\n${formatEntries(todayEntries)}`
    } else {
      todaySection = "TODAY: None yet"
    }

    const formattedEntries = `${yesterdaySection}\n\n${todaySection}`

    // Generate standup with optimized prompt
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    // Optimized prompt: ~60% fewer tokens
    const prompt = `Daily standup from work logs (plain text, 1-3 bullets each section):

${formattedEntries}

Format:
Yesterday:
Today:
Blockers: (infer from content or "None")`

    const result = await model.generateContent(prompt)
    const standupContent = result.response.text()

    // Cache the result and increment rate limit
    await Promise.all([
      setCachedStandup(supabase, userId, entriesHash, standupContent),
      incrementRateLimit(supabase, userId, "standup"),
    ])

    return NextResponse.json({
      content: standupContent,
      cached: false,
      remaining: remaining - 1,
    })
  } catch (error: any) {
    console.error("Error generating standup:", error)
    return NextResponse.json({ error: error.message || "Failed to generate standup" }, { status: 500 })
  }
}
