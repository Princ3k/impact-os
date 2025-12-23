"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"

interface Entry {
  id: string
  created_at: string
  content: string
}

export default function EntryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [entry, setEntry] = useState<Entry | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchEntry = async () => {
      if (!user) return

      const { data, error } = await supabase
        .from("entries")
        .select("*")
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single()

      if (error) {
        console.error("Error fetching entry:", error)
      } else {
        setEntry(data)
      }
      setLoading(false)
    }

    fetchEntry()
  }, [params.id, user])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleDelete = async () => {
    if (!user || !entry) return

    const { error } = await supabase.from("entries").delete().eq("id", entry.id).eq("user_id", user.id)

    if (error) {
      console.error("Error deleting entry:", error)
    } else {
      router.push("/timeline")
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen px-4 py-8 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </main>
    )
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
            {formatDate(entry.created_at)}
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
