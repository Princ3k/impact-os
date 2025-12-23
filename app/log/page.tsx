"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Check, Sparkles } from "lucide-react"
import { Capybara } from "@/components/capybara"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"

export default function DailyLogPage() {
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { user } = useAuth()

  const handleSave = async () => {
    if (!content.trim() || !user) return

    setIsSaving(true)
    setError("")

    try {
      const { error: insertError } = await supabase.from("entries").insert({
        user_id: user.id,
        content: content.trim(),
      })

      if (insertError) throw insertError

      setSaved(true)
      await new Promise((resolve) => setTimeout(resolve, 800))

      router.push("/timeline")
    } catch (err: any) {
      setError(err.message || "Failed to save entry")
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
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
          <Capybara mood="thinking" size={80} />
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-xs font-medium">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Daily Log</h1>
            <p className="text-muted-foreground text-sm">What wins did you have today?</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-1">
          <Textarea
            placeholder="Describe the tasks you completed, problems you solved, or progress you made..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[220px] resize-none border-0 focus-visible:ring-0 text-base leading-relaxed bg-transparent"
          />
        </div>

        {content.trim() && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Capybara mood="excited" size={40} />
              <span className="italic">{'"Looking good!"'}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Button
          onClick={handleSave}
          disabled={!content.trim() || isSaving}
          className="w-full h-12 text-base font-medium rounded-xl shadow-sm"
          size="lg"
        >
          {saved ? (
            <>
              <Check className="mr-2 h-5 w-5" />
              Saved!
            </>
          ) : isSaving ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Save entry
            </>
          )}
        </Button>
      </div>
    </main>
  )
}
