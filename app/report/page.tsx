"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, FileText, Users, Sparkles } from "lucide-react"
import { Capybara } from "@/components/capybara"

export default function ReportGeneratorPage() {
  const [reportType, setReportType] = useState("weekly")
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  const handleGenerate = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch("/api/generateReport", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reportType }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate report")
      }

      // Store the generated report and navigate
      sessionStorage.setItem("impactOS_reportType", reportType)
      sessionStorage.setItem("impactOS_reportContent", data.content)
      if (data.reportId) {
        sessionStorage.setItem("impactOS_reportId", data.reportId)
      }

      router.push("/report/view")
    } catch (error: any) {
      console.error("Error generating report:", error)
      alert(error.message || "Failed to generate report")
      setIsGenerating(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-32 left-0 w-56 h-56 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="flex items-center gap-4">
          <Capybara mood="excited" size={80} />
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-xs font-medium">
              <Sparkles className="h-3 w-3" />
              Show your impact
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Generate Report</h1>
            <p className="text-muted-foreground text-sm">Choose a format to summarize your work</p>
          </div>
        </div>

        <RadioGroup value={reportType} onValueChange={setReportType} className="space-y-3">
          <Label
            htmlFor="weekly"
            className={`flex items-center gap-4 p-5 bg-card border rounded-xl cursor-pointer transition-all duration-300 ${
              reportType === "weekly"
                ? "border-primary shadow-sm ring-1 ring-primary/20"
                : "border-border hover:border-primary/30"
            }`}
          >
            <RadioGroupItem value="weekly" id="weekly" className="sr-only" />
            <div
              className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                reportType === "weekly" ? "bg-primary/20" : "bg-muted"
              }`}
            >
              <FileText className={`h-5 w-5 ${reportType === "weekly" ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1">
              <span className="font-semibold text-foreground">Weekly Summary</span>
              <p className="text-sm text-muted-foreground mt-0.5">Overview of your work from the past 7 days</p>
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                reportType === "weekly" ? "border-primary bg-primary" : "border-border"
              }`}
            >
              {reportType === "weekly" && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
            </div>
          </Label>

          <Label
            htmlFor="one_on_one"
            className={`flex items-center gap-4 p-5 bg-card border rounded-xl cursor-pointer transition-all duration-300 ${
              reportType === "one_on_one"
                ? "border-primary shadow-sm ring-1 ring-primary/20"
                : "border-border hover:border-primary/30"
            }`}
          >
            <RadioGroupItem value="one_on_one" id="one_on_one" className="sr-only" />
            <div
              className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                reportType === "one_on_one" ? "bg-primary/20" : "bg-muted"
              }`}
            >
              <Users className={`h-5 w-5 ${reportType === "one_on_one" ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1">
              <span className="font-semibold text-foreground">1:1 Prep</span>
              <p className="text-sm text-muted-foreground mt-0.5">Formatted for manager conversations</p>
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                reportType === "one_on_one" ? "border-primary bg-primary" : "border-border"
              }`}
            >
              {reportType === "one_on_one" && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
            </div>
          </Label>
        </RadioGroup>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full h-12 text-base font-medium rounded-xl shadow-sm"
          size="lg"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Generating...
            </span>
          ) : (
            "Generate report"
          )}
        </Button>
      </div>
    </main>
  )
}
