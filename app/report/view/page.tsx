"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Copy, Share2, Check, FileText, Users } from "lucide-react"
import { Capybara } from "@/components/capybara"
import { MarkdownRenderer } from "@/components/markdown-renderer"

export default function ReportViewerPage() {
  const [report, setReport] = useState("")
  const [reportType, setReportType] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const type = sessionStorage.getItem("impactOS_reportType") || "weekly"
    const content = sessionStorage.getItem("impactOS_reportContent")

    setReportType(type)

    if (content) {
      setReport(content)
    } else {
      setReport("No report generated. Please go back and generate a report.")
    }
  }, [])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(report)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: reportType === "weekly" ? "Weekly Summary" : "1:1 Prep",
          text: report,
        })
      } catch (error: any) {
        // Ignore AbortError (user canceled) and InvalidStateError (share already in progress)
        if (error.name !== "AbortError" && error.name !== "InvalidStateError") {
          console.error("Share error:", error)
          // Fallback to copy if share fails for other reasons
          handleCopy()
        }
      }
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

        <div className="p-6 bg-card border border-border rounded-2xl shadow-sm">
          <MarkdownRenderer content={report} />
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
