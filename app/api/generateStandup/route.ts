import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextRequest, NextResponse } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

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

    // Fetch the most recent entries
    // Logic: Get yesterday's and today's entries if available, otherwise get the 2 most recent
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Try to fetch today's and yesterday's entries
    const { data: recentEntries, error: fetchError } = await supabase
      .from("entries")
      .select("content, created_at")
      .eq("user_id", session.user.id)
      .gte("created_at", yesterday.toISOString())
      .order("created_at", { ascending: false })
      .limit(5)

    if (fetchError) {
      return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 })
    }

    // If no recent entries from yesterday/today, fall back to the 2 most recent entries overall
    let entries = recentEntries || []

    if (entries.length === 0) {
      const { data: fallbackEntries, error: fallbackError } = await supabase
        .from("entries")
        .select("content, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(2)

      if (fallbackError) {
        return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 })
      }

      entries = fallbackEntries || []
    }

    if (entries.length === 0) {
      return NextResponse.json(
        { content: "No work entries found.\n\nLog your work to generate a daily standup." },
        { status: 200 }
      )
    }

    // Format entries for AI
    const formattedEntries = entries
      .map((entry) => {
        const date = new Date(entry.created_at).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
        return `${date}: ${entry.content}`
      })
      .join("\n\n")

    // Generate standup using Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp"
    })

    const systemPrompt =
      "You are generating a concise daily standup update for a team. Be brief, factual, and professional. Avoid fluff."

    const userPrompt = `Here are my recent work logs:

${formattedEntries}

Create a daily standup with exactly these sections:
Yesterday:
Today:
Blockers:

IMPORTANT:
- Keep each section to 1-3 bullet points maximum
- Use plain text format (no markdown formatting)
- Be direct and concise
- If there are no blockers, write "None" for the Blockers section
- If you can't identify what was done yesterday vs today from the logs, make your best inference based on the dates`

    const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`)
    const standupContent = result.response.text()

    // Do NOT save to database as per requirements
    return NextResponse.json({
      content: standupContent,
    })
  } catch (error: any) {
    console.error("Error generating standup:", error)
    return NextResponse.json({ error: error.message || "Failed to generate standup" }, { status: 500 })
  }
}
