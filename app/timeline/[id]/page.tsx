"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface Entry {
  id: number
  date: string
  content: string
}

export default function EntryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [entry, setEntry] = useState<Entry | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("impactOS_entries")
    if (stored) {
      const entries: Entry[] = JSON.parse(stored)
      const found = entries.find((e) => e.id === Number(params.id))
      setEntry(found || null)
    }
  }, [params.id])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleDelete = () => {
    const stored = localStorage.getItem("impactOS_entries")
    if (stored) {
      const entries: Entry[] = JSON.parse(stored)
      const filtered = entries.filter((e) => e.id !== Number(params.id))
      localStorage.setItem("impactOS_entries", JSON.stringify(filtered))
      router.push("/timeline")
    }
  }

  if (!entry) {
    return (
      <main className="min-h-screen px-4 py-8">
        <div className="w-full max-w-lg mx-auto">
          <Link
            href="/timeline"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to timeline
          </Link>
          <div className="py-16 text-center">
            <p className="text-muted-foreground">Entry not found</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg mx-auto space-y-6">
        <Link
          href="/timeline"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to timeline
        </Link>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-xs font-medium">
            <Calendar className="h-3 w-3" />
            {formatDate(entry.date)}
          </div>
          <p className="text-foreground whitespace-pre-wrap leading-relaxed">{entry.content}</p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete entry
        </Button>
      </div>
    </main>
  )
}
