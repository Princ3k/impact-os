"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar } from "lucide-react"
import { Capybara } from "@/components/capybara"

interface Entry {
  id: number
  date: string
  content: string
}

export default function TimelinePage() {
  const [entries, setEntries] = useState<Entry[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("impactOS_entries")
    if (stored) {
      setEntries(JSON.parse(stored))
    }
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const getPreview = (content: string) => {
    return content.length > 80 ? content.slice(0, 80) + "..." : content
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-20 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
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
          <Capybara mood="proud" size={80} />
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 rounded-full text-accent-foreground text-xs font-medium">
              <Calendar className="h-3 w-3" />
              Your journey
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Timeline</h1>
            <p className="text-muted-foreground text-sm">Look back at your accomplishments</p>
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="py-12 text-center">
            <Capybara mood="sleepy" size={100} className="mx-auto mb-4" />
            <p className="text-muted-foreground mb-3">{'"No entries yet... let\'s change that!"'}</p>
            <Link
              href="/log"
              className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
            >
              Log your first entry
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, index) => (
              <Link key={entry.id} href={`/timeline/${entry.id}`} className="group block">
                <div className="p-4 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 bg-primary/60 rounded-full group-hover:bg-primary transition-colors" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1 font-medium">{formatDate(entry.date)}</p>
                      <p className="text-sm text-foreground leading-relaxed">{getPreview(entry.content)}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
