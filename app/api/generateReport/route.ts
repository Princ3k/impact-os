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

    const { reportType } = await request.json()

    if (!reportType || !["weekly", "one_on_one"].includes(reportType)) {
      return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
    }

    // Fetch entries from the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: entries, error: fetchError } = await supabase
      .from("entries")
      .select("content, created_at")
      .eq("user_id", session.user.id)
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: false })

    if (fetchError) {
      return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 })
    }

    if (!entries || entries.length === 0) {
      return NextResponse.json(
        { content: "No entries found in the past 7 days.\n\nLog your work to generate a report." },
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
    // Using gemini-2.0-flash-exp (free tier model available in 2025)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp"
    })

    const systemPrompt =
      "You are a professional career assistant helping summarize work for a manager. Be concise, specific, and confident. Avoid buzzwords and fluff. Format your response using clean Markdown with proper headings (##), bold (**text**), and bullet points (-)."

    const userPrompt = `Here are my work logs:

${formattedEntries}

Create a ${reportType === "weekly" ? "weekly summary" : "1:1 meeting prep"} formatted in clean Markdown with:

## What I Worked On
(Brief bullet points of main activities)

## Key Wins
(Notable achievements and completed work)

## Impact
(How this work moved the needle)

## Blockers
(Any current challenges - omit this section if none)

## Next Steps
(What's coming up next)

Use proper Markdown formatting:
- Headings with ##
- Bold important items with **text**
- Clean bullet points with -
- Professional, conversational tone`

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
