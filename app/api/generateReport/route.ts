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
      .eq("user_id", session.user.id)
      .gte("created_at", fromDate.toISOString())
      .lte("created_at", toDate.toISOString())
      .order("created_at", { ascending: false })

    if (fetchError) {
      return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 })
    }

    if (!entries || entries.length === 0) {
      return NextResponse.json(
        { content: "No entries found in the selected date range.\n\nLog your work to generate a report." },
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

    // Generate report using Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash"
    })

    const systemPrompt =
      "You are writing a professional work summary as if you're the person who did the work. Write in first person, be direct and conversational like you're talking to your manager in person. Avoid corporate buzzwords, don't over-explain, and don't make it sound AI-generated. Be confident but not boastful."

    const userPrompt = `Here are my work logs from the past period:

${formattedEntries}

Write a ${reportType === "weekly" ? "concise weekly summary" : "focused 1:1 prep document"} that sounds natural and authentic. Structure it with these sections:

## What I Worked On
- List the main tasks and projects (2-4 bullet points max)
- Be specific but brief - just the facts

## Key Wins
- Highlight 2-3 concrete accomplishments
- Focus on completed work and tangible results
- Skip the fluff and self-promotion

## Impact
- Explain how this work helps the team or product
- 1-2 sentences per point, maximum 3 points
- Be direct about the value created

${formattedEntries.toLowerCase().includes('block') || formattedEntries.toLowerCase().includes('issue') || formattedEntries.toLowerCase().includes('problem') ? '## Blockers\n- List current challenges clearly\n- What help is needed (if any)\n' : ''}
## Next Steps
- What's coming up next (2-3 items)
- Keep it brief and actionable

IMPORTANT:
- Use ## for headings
- Use - for bullet points
- NO bold text (**) - just write naturally
- Write like you're texting your manager, not writing a press release
- Be conversational: "I worked on X" not "Successfully executed strategic initiative X"
- If something was hard, say it was hard. If it's half-done, say that.`

    const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`)
    const reportContent = result.response.text()

    // Save report to database
    const { data: savedReport, error: saveError } = await supabase
      .from("reports")
      .insert({
        user_id: session.user.id,
        type: reportType,
        content: reportContent,
      })
      .select()
      .single()

    if (saveError) {
      console.error("Failed to save report:", saveError)
      // Still return the generated content even if save fails
    }

    return NextResponse.json({
      content: reportContent,
      reportId: savedReport?.id,
    })
  } catch (error: any) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: error.message || "Failed to generate report" }, { status: 500 })
  }
}
