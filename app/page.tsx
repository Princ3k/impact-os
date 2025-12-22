import Link from "next/link"
import { PenLine, FileText, Sparkles, ArrowRight } from "lucide-react"
import { Logo } from "@/components/logo"

export default function Dashboard() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-8 text-center">
        <div className="flex flex-col items-center">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Track your wins
          </div>
          <Logo size="lg" showTagline />
        </div>

        <div className="flex flex-col gap-4">
          <Link href="/log" className="group">
            <div className="p-6 bg-card rounded-2xl shadow-sm border border-border hover:shadow-md hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <PenLine className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h2 className="font-semibold text-foreground">Log today's work</h2>
                  <p className="text-sm text-muted-foreground">Capture what you accomplished</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>

          <Link href="/report" className="group">
            <div className="p-6 bg-card rounded-2xl shadow-sm border border-border hover:shadow-md hover:border-accent/30 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                  <FileText className="h-5 w-5 text-accent-foreground" />
                </div>
                <div className="flex-1 text-left">
                  <h2 className="font-semibold text-foreground">Generate report</h2>
                  <p className="text-sm text-muted-foreground">Summarize your achievements</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent-foreground group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
        </div>

        <nav className="pt-6">
          <Link
            href="/timeline"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            View past entries
            <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>
      </div>
    </main>
  )
}
