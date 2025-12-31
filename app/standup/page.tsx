"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Copy, Check, MessageSquare } from "lucide-react"
import { Capybara } from "@/components/capybara"

export default function StandupPage() {
  const [standup, setStandup] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  const handleGenerate = async () => {
    setLoading(true)
    setError("")
    setStandup("")

    try {
      const response = await fetch("/api/generateStandup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate standup")
      }

      const data = await response.json()
      setStandup(data.content)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (standup) {
      await navigator.clipboard.writeText(standup)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
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
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full text-blue-500 text-xs font-medium">
              <MessageSquare className="h-3 w-3" />
              Daily Standup
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Generate Standup</h1>
            <p className="text-sm text-muted-foreground">Quick daily update for your team</p>
          </div>
        </div>

        {!standup && (
          <div className="p-6 bg-card border border-border rounded-2xl shadow-sm text-center space-y-4">
            <p className="text-muted-foreground">
              Generate a concise daily standup update based on your recent work entries.
            </p>
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full h-12 rounded-xl font-medium"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Generate Standup
                </>
              )}
            </Button>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
            {error}
          </div>
        )}

        {standup && (
          <>
            <div className="p-6 bg-card border border-border rounded-2xl shadow-sm">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                {standup}
              </pre>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCopy}
                className="flex-1 h-11 rounded-xl font-medium bg-transparent"
              >
                {copied ? (
                  <Check className="mr-2 h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                {copied ? "Copied!" : "Copy to Clipboard"}
              </Button>
              <Button
                variant="outline"
                onClick={handleGenerate}
                disabled={loading}
                className="flex-1 h-11 rounded-xl font-medium bg-transparent"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
