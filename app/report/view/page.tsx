"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Copy, Share2, Check, FileText, Users } from "lucide-react"
import { Capybara } from "@/components/capybara"

interface Entry {
  id: number
  date: string
  content: string
}

export default function ReportViewerPage() {
  const [report, setReport] = useState("")
  const [reportType, setReportType] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const type = sessionStorage.getItem("impactOS_reportType") || "weekly"
    setReportType(type)

    const stored = localStorage.getItem("impactOS_entries")
    const entries: Entry[] = stored ? JSON.parse(stored) : []

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentEntries = entries.filter((e) => new Date(e.date) >= sevenDaysAgo)

    if (recentEntries.length === 0) {
      setReport("No entries found in the past 7 days.\n\nLog your work to generate a report.")
      return
    }

    if (type === "weekly") {
      setReport(generateWeeklyReport(recentEntries))
    } else {
      setReport(generate1on1Report(recentEntries))
    }
  }, [])

  const generateWeeklyReport = (entries: Entry[]) => {
    const header = "WEEKLY SUMMARY\n" + "─".repeat(30) + "\n\n"
    const content = entries
      .map((e) => {
        const date = new Date(e.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
        return `${date}\n${e.content}`
      })
      .join("\n\n• • •\n\n")

    return header + content
  }

  const generate1on1Report = (entries: Entry[]) => {
    const header = "1:1 MEETING PREP\n" + "─".repeat(30) + "\n\n"
    const accomplishments = "ACCOMPLISHMENTS:\n" + entries.map((e) => `  • ${e.content.split("\n")[0]}`).join("\n")

    return header + accomplishments + "\n\n\nDISCUSSION POINTS:\n  • [Add your discussion topics here]"
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(report)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: reportType === "weekly" ? "Weekly Summary" : "1:1 Prep",
        text: report,
      })
    } else {
      handleCopy()
    }
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg mx-auto space-y-6">
        <Link
          href="/report"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="flex items-center gap-4">
          <Capybara mood="proud" size={80} />
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-xs font-medium">
              {reportType === "weekly" ? <FileText className="h-3 w-3" /> : <Users className="h-3 w-3" />}
              {reportType === "weekly" ? "Weekly Summary" : "1:1 Prep"}
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Your Report</h1>
            <p className="text-sm text-muted-foreground italic">{'"You\'re doing amazing!"'}</p>
          </div>
        </div>

        <div className="p-5 bg-card border border-border rounded-2xl shadow-sm">
          <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">{report}</pre>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleCopy} className="flex-1 h-11 rounded-xl font-medium bg-transparent">
            {copied ? <Check className="mr-2 h-4 w-4 text-green-600" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button variant="outline" onClick={handleShare} className="flex-1 h-11 rounded-xl font-medium bg-transparent">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
    </main>
  )
}
