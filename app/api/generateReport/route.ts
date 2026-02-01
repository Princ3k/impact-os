import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextRequest, NextResponse } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { checkRateLimit, incrementRateLimit } from "@/lib/api-utils"

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
    const { allowed, remaining } = await checkRateLimit(supabase, userId, "report")
    if (!allowed) {
      return NextResponse.json(
        { error: "Daily limit reached. Try again tomorrow.", remaining: 0 },
        { status: 429 }
      )
    }

    const { reportType, dateRange } = await request.json()

    if (!reportType || !["weekly", "one_on_one"].includes(reportType)) {
      return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
    }

    // Determine date range (default to 7 days if not provided)
    const fromDate = dateRange?.from
      ? new Date(dateRange.from)
      : (() => {
          const date = new Date()
          date.setDate(date.getDate() - 7)
          return date
        })()

    const toDate = dateRange?.to ? new Date(dateRange.to) : new Date()

    const { data: entries, error: fetchError } = await supabase
      .from("entries")
      .select("content, created_at")
      .eq("user_id", userId)
      .gte("created_at", fromDate.toISOString())
      .lte("created_at", toDate.toISOString())
      .order("created_at", { ascending: false })

    if (fetchError) {
      return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 })
    }

    if (!entries || entries.length === 0) {
      return NextResponse.json(
        { content: "No entries found in the selected date range.\n\nLog your work to generate a report.", remaining },
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
      .join("\n")

    // Generate report with optimized prompt
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const isWeekly = reportType === "weekly"
    const hasBlockers =
      formattedEntries.toLowerCase().includes("block") ||
      formattedEntries.toLowerCase().includes("issue") ||
      formattedEntries.toLowerCase().includes("problem")

    // Optimized prompt: ~50% fewer tokens
    const prompt = `Write a ${isWeekly ? "weekly summary" : "1:1 prep doc"} from these work logs. First person, conversational, no buzzwords.

${formattedEntries}

Sections (## headings, - bullets, no **bold**):
## What I Worked On (2-4 items)
## Key Wins (2-3 concrete results)
## Impact (1-2 sentences each, max 3)
${hasBlockers ? "## Blockers (challenges, help needed)" : ""}
## Next Steps (2-3 actionable items)

Be direct. Say "I worked on X" not "Successfully executed X".`

    const result = await model.generateContent(prompt)
    const reportContent = result.response.text()

    // Increment rate limit
    await incrementRateLimit(supabase, userId, "report")

    // Save report to database
    const { data: savedReport, error: saveError } = await supabase
      .from("reports")
      .insert({
        user_id: userId,
        type: reportType,
        content: reportContent,
      })
      .select()
      .single()

    if (saveError) {
      console.error("Failed to save report:", saveError)
    }

    return NextResponse.json({
      content: reportContent,
      reportId: savedReport?.id,
      remaining: remaining - 1,
    })
  } catch (error: any) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: error.message || "Failed to generate report" }, { status: 500 })
  }
}
