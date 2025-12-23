"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, Users, ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Capybara } from "@/components/capybara"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"

interface Report {
  id: string
  created_at: string
  type: "weekly" | "one_on_one"
  content: string
}

export default function ReportHistoryPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchReports = async () => {
      if (!user) return

      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching reports:", error)
      } else {
        setReports(data || [])
      }
      setLoading(false)
    }

    fetchReports()
  }, [user])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getPreview = (content: string) => {
    return content.length > 100 ? content.slice(0, 100) + "..." : content
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent expanding/collapsing when clicking delete

    if (!user || !confirm("Are you sure you want to delete this report?")) return

    setDeletingId(id)

    const { error } = await supabase
      .from("reports")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Error deleting report:", error)
      alert("Failed to delete report")
    } else {
      // Remove from local state
      setReports(reports.filter((r) => r.id !== id))
      if (expandedId === id) {
        setExpandedId(null)
      }
    }

    setDeletingId(null)
  }

  if (loading) {
    return (
      <main className="min-h-screen px-4 py-8 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-20 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl mx-auto space-y-6">
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
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 rounded-full text-accent-foreground text-xs font-medium">
              <FileText className="h-3 w-3" />
              Report archive
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Report History</h1>
            <p className="text-muted-foreground text-sm">View your previously generated reports</p>
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="py-12 text-center">
            <Capybara mood="sleepy" size={100} className="mx-auto mb-4" />
            <p className="text-muted-foreground mb-3">{'"No reports yet... let\'s create one!"'}</p>
            <Link
              href="/report"
              className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
            >
              Generate your first report
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="bg-card rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => toggleExpand(report.id)}
                  className="w-full p-5 flex items-start gap-4 hover:bg-accent/5 transition-colors text-left"
                >
                  <div
                    className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${
                      report.type === "weekly" ? "bg-primary/10" : "bg-accent/20"
                    }`}
                  >
                    {report.type === "weekly" ? (
                      <FileText className="h-5 w-5 text-primary" />
                    ) : (
                      <Users className="h-5 w-5 text-accent-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">
                        {report.type === "weekly" ? "Weekly Summary" : "1:1 Prep"}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{formatDate(report.created_at)}</span>
                    </div>
                    {expandedId !== report.id && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{getPreview(report.content)}</p>
                    )}
                  </div>

                  <div className="flex-shrink-0 text-muted-foreground">
                    {expandedId === report.id ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </button>

                {expandedId === report.id && (
                  <div className="px-5 pb-5 pt-0 border-t border-border/50">
                    <div className="mt-4">
                      <MarkdownRenderer content={report.content} />
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDelete(report.id, e)}
                        disabled={deletingId === report.id}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        {deletingId === report.id ? (
                          <>
                            <span className="h-4 w-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mr-2" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete report
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
