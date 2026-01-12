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

    // Fetch entries and categorize by date
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const twoDaysAgo = new Date(yesterday)
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 1)

    // Fetch entries from the last 3 days to ensure we have enough data
    const { data: allEntries, error: fetchError } = await supabase
      .from("entries")
      .select("content, created_at")
      .eq("user_id", session.user.id)
      .gte("created_at", twoDaysAgo.toISOString())
      .order("created_at", { ascending: false })

    if (fetchError) {
      return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 })
    }

    if (!allEntries || allEntries.length === 0) {
      return NextResponse.json(
        { content: "No work entries found.\n\nLog your work to generate a daily standup." },
        { status: 200 }
      )
    }

    // Categorize entries by date (using local timezone)
    const todayEntries: any[] = []
    const yesterdayEntries: any[] = []
    const olderEntries: any[] = []

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
    const formatEntries = (entries: any[]) => {
      return entries
        .map((entry) => {
          const time = new Date(entry.created_at).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })
          return `- ${entry.content} (logged at ${time})`
        })
        .join("\n")
    }

    let yesterdaySection = ""
    if (yesterdayEntries.length > 0) {
      yesterdaySection = `YESTERDAY'S WORK:\n${formatEntries(yesterdayEntries)}`
    } else if (olderEntries.length > 0) {
      // Use older entries if no yesterday entries
      const recentOlder = olderEntries.slice(0, 2)
      yesterdaySection = `RECENT WORK (before today):\n${formatEntries(recentOlder)}`
    } else {
      yesterdaySection = "YESTERDAY'S WORK:\nNo entries logged"
    }

    let todaySection = ""
    if (todayEntries.length > 0) {
      todaySection = `TODAY'S WORK:\n${formatEntries(todayEntries)}`
    } else {
      todaySection = "TODAY'S WORK:\nNo entries logged yet"
    }

    const formattedEntries = `${yesterdaySection}\n\n${todaySection}`

    // Generate standup using Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp"
    })

    const systemPrompt =
      "You are generating a concise daily standup update for a team. Be brief, factual, and professional. Avoid fluff."

    const userPrompt = `Here are my work logs, already categorized by date:

${formattedEntries}

Create a daily standup with exactly these sections:
Yesterday:
Today:
Blockers:

IMPORTANT:
- Summarize the work from each category into 1-3 concise bullet points
- Use plain text format (no markdown formatting)
- Be direct and concise
- For "Yesterday", use the YESTERDAY'S WORK or RECENT WORK section
- For "Today", use the TODAY'S WORK section
- For "Blockers", infer from the content if there are any issues, challenges, or dependencies mentioned. If none, write "None"
- If a section says "No entries logged", write something like "Nothing logged" or "No updates"`

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
